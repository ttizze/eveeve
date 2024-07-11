import { zValidator } from '@hono/zod-validator'
import { type SupabaseClient, createClient } from '@supabase/supabase-js'
import { Hono } from 'hono'
import type { Context } from 'hono'
import {
  type TranslationRequest,
  translationRequestSchema,
} from '../../../types/translation-request'
import { getGeminiModelResponse } from '../services/gemini'
import { extractTranslations } from '../utils/extractTranslations'

interface LogEntry {
  timestamp: string
  type: string
  content: string
}

// メモリ内ログ保持用の配列（注意：これはワーカーの再起動時にリセットされます）
const inMemoryLogs: LogEntry[] = []

function logToMemory(type: string, content: string) {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    type,
    content,
  }
  inMemoryLogs.push(logEntry)
  console.log(`[${logEntry.timestamp}] ${type}: ${content}`)
}

const app = new Hono()

interface TranslationElement {
  number: number
  text: string
}

async function getOrCreatePage(
  supabase: SupabaseClient,
  url: string,
): Promise<number> {
  const { data, error } = await supabase
    .from('pages')
    .select('id')
    .eq('url', url)
    .maybeSingle()

  if (error) {
    console.error('Error fetching page:', error)
    throw new Error('Error fetching page data')
  }

  if (data) return data.id

  const { data: newPage, error: insertError } = await supabase
    .from('pages')
    .insert({ url })
    .select()
    .single()

  if (insertError) {
    console.error('Error inserting new page:', insertError)
    throw new Error('Error creating new page')
  }

  return newPage.id
}
async function getOrCreateSourceText(
  supabase: SupabaseClient,
  text: string,
  pageId: number,
): Promise<number> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)

  // SHA-256ハッシュを計算
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  const textHash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  const { data: sourceData, error: sourceError } = await supabase
    .from('source_texts')
    .select('id')
    .eq('text_hash', textHash)
    .eq('page_id', pageId)
    .maybeSingle()

  if (sourceError) {
    console.error('Error fetching source_texts:', sourceError)
    throw sourceError
  }

  if (sourceData) {
    return sourceData.id
  }

  const { data: newSourceData, error: newSourceError } = await supabase
    .from('source_texts')
    .insert({ text, page_id: pageId })
    .select('id')
    .single()

  if (newSourceError) {
    console.error('Error inserting new source text:', newSourceError)
    throw newSourceError
  }

  return newSourceData.id
}

async function getOrCreateTranslations(
  supabase: SupabaseClient,
  elements: TranslationElement[],
  target_language: string,
  pageId: number,
  geminiApiKey: string,
  title: string,
): Promise<TranslationElement[]> {
  const translations: TranslationElement[] = []
  const untranslatedElements: TranslationElement[] = []

  for (const element of elements) {
    const sourceId = await getOrCreateSourceText(supabase, element.text, pageId)

    const { data: translationData, error: translationError } = await supabase
      .from('translate_texts')
      .select('text')
      .eq('source_text_id', sourceId)
      .eq('language', target_language)
      .order('point', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (translationError) {
      console.error('Error fetching translation:', translationError)
      throw translationError
    }

    if (translationData) {
      translations.push({ number: element.number, text: translationData.text })
    } else {
      untranslatedElements.push(element)
    }
  }

  if (untranslatedElements.length > 0) {
    const source_text = untranslatedElements
      .map(
        el =>
          `{"number": ${el.number}, "text": "${el.text.replace(/"/g, '\\"')}"}`,
      )
      .join('\n')
    logToMemory('source-text', source_text)
    let translatedText = ''
    try {
      translatedText = await getGeminiModelResponse(
        geminiApiKey,
        title,
        source_text,
        target_language,
      )
    } catch (error) {
      console.error('Error fetching translation:', error)
      translations.push(...untranslatedElements)
      // エラーが発生した場合、ここで処理を終了
      const sortedTranslations = translations.sort(
        (a, b) => a.number - b.number,
      )
      return sortedTranslations
    }
    logToMemory('translated-text', translatedText)
    const extractedTranslations = extractTranslations(translatedText)

    for (const translation of extractedTranslations) {
      translations.push(translation)

      const sourceText = untranslatedElements.find(
        el => el.number === translation.number,
      )?.text
      if (!sourceText) {
        console.error(
          `Source text not found for translation number ${translation.number}`,
        )
        continue
      }

      const sourceId = await getOrCreateSourceText(supabase, sourceText, pageId)
      const systemUserId = '00000000-0000-0000-0000-000000000000'
      const { error: translateError } = await supabase
        .from('translate_texts')
        .insert({
          language: target_language,
          text: translation.text,
          source_text_id: sourceId,
          page_id: pageId,
          user_id: systemUserId,
        })

      if (translateError) {
        console.error('Error inserting translation:', translateError)
        throw translateError
      }
    }
  }

  const sortedTranslations = translations.sort((a, b) => a.number - b.number)
  return sortedTranslations
}

app.get('/logs', c => {
  return c.json(inMemoryLogs)
})
app.post(
  '/',
  zValidator('json', translationRequestSchema),
  async (c: Context) => {
    const {
      numberedElements,
      target_language,
      url,
      title,
    }: TranslationRequest = await c.req.json()
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY)

    try {
      const pageId = await getOrCreatePage(supabase, url || '')
      const translations = await getOrCreateTranslations(
        supabase,
        numberedElements,
        target_language,
        pageId,
        c.env.GEMINI_API_KEY,
        title,
      )

      logToMemory('response-translations', JSON.stringify(translations))
      return c.json({ translations })
    } catch (error) {
      console.error('Translation error:', error)
      return c.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        500,
      )
    }
  },
)

export default app

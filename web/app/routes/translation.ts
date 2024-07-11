

import { displayContent } from '../utils/articleUtils'

const MAX_CHUNK_SIZE = 20000

function splitNumberedElements(
  elements: { number: number; text: string }[],
): { number: number; text: string }[][] {
  const chunks: { number: number; text: string }[][] = []
  let currentChunk: { number: number; text: string }[] = []
  let currentSize = 0

  for (const element of elements) {
    if (
      currentSize + element.text.length > MAX_CHUNK_SIZE &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk)
      currentChunk = []
      currentSize = 0
    }
    currentChunk.push(element)
    currentSize += element.text.length
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk)
  }
  return chunks
}

export async function translate(
  title: string,
  numberedContent: string,
  numberedElements: {
    number: number
    text: string
  }[],
  url: string,
): Promise<string> {
  const chunks = splitNumberedElements(numberedElements)
  const allTranslations: { number: number; text: string }[] = []
  for (const chunk of chunks) {
    const translationResponse = await fetch(
      `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/translate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numberedElements: chunk,
          title: title,
          target_language: 'ja',
          url: url,
          translationMode: 'read',
        }),
      },
    )

    const translationText = await translationResponse.text()
    if (!translationText.trim()) {
      continue
    }

    console.log('translationText', translationText)
    const translations = extractTranslations(translationText)
    allTranslations.push(...translations)
  }
  console.log('allTranslations', allTranslations)
  if (allTranslations.length === 0) {
    return numberedContent
  }
  const translatedContent = await displayContent(
    numberedContent,
    allTranslations,
  )
  const response = await fetch(
    `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/save-article`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        content: translatedContent,
        title: title,
      }),
    },
  )
  const responseText = await response.text()
  return responseText
}

export function extractTranslations(
  text: string,
): { number: number; text: string }[] {
  const translations: { number: number; text: string }[] = []
  const regex =
    /{\s*"number"\s*:\s*(\d+)\s*,\s*"text"\s*:\s*"((?:\\.|[^"\\])*)"\s*}/g
  let match: RegExpExecArray | null

  while (true) {
    match = regex.exec(text)
    if (match === null) break

    translations.push({
      number: Number.parseInt(match[1], 10),
      text: match[2].replace(/\\"/g, '"').replace(/\\n/g, '\n'),
    })
  }

  return translations
}

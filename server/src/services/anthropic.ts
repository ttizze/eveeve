import Anthropic from '@anthropic-ai/sdk'
import type { TranslationRequest } from '../../../types/translation-request'

import { generateSystemMessage } from '../utils/generateAnthropicSystemMessage'

export async function callAnthropicStream(
  apiKey: string | undefined,
  body: TranslationRequest,
) {
  console.log('createTranslation', body)
  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }

  const client = new Anthropic({
    apiKey: apiKey,
  })

  const model = 'claude-3-haiku-20240307'

  return client.messages.stream(
    {
      messages: [{ role: 'user', content: generateSystemMessage(body) }],
      model: model,
      max_tokens: 4096,
      temperature: 0,
    },
    { maxRetries: 5 },
  )
}

export async function callAnthropic(
  apiKey: string | undefined,
  body: TranslationRequest,
): Promise<Anthropic.Messages.Message> {
  console.log('createTranslation', body)
  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }

  const client = new Anthropic({
    apiKey: apiKey,
  })

  const model = 'claude-3-haiku-20240307'
  return await client.messages.create({
    messages: [{ role: 'user', content: generateSystemMessage(body) }],
    model: model,
    max_tokens: 4096,
    temperature: 0,
  })
}

import type { TranslationRequest } from '../../../types/translation-request'
import { generateSystemMessage } from '../utils/generateGeminiMessage'

export async function getGeminiModelStream(
  body: TranslationRequest,
  env: {
    ACCOUNT_ID: string
    GATEWAY_ID: string
    VERTEX_API_KEY: string
    PROJECT_NAME: string
    REGION: string
  },
): Promise<ReadableStream<Uint8Array>> {
  const modelId = 'gemini-1.5-pro-001'
  const url = `https://gateway.ai.cloudflare.com/v1/${env.ACCOUNT_ID}/${env.GATEWAY_ID}/google-vertex-ai/v1/projects/${env.PROJECT_NAME}/locations/${env.REGION}/publishers/google/models/${modelId}:streamGenerateContent`

  const requestData = {
    contents: [
      {
        role: 'user',
        parts: [{ text: generateSystemMessage(body) }],
      },
    ],
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.VERTEX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      console.error(
        'API request failed:',
        response.status,
        await response.text(),
      )
      throw new Error(`API request failed with status ${response.status}`)
    }

    if (!response.body) {
      throw new Error('Response body is undefined')
    }

    return response.body.pipeThrough(new TextDecoderStream()).pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          console.log('Received chunk:', chunk) // 受信したチャンクをログ出力
          try {
            const data = JSON.parse(chunk)
            console.log('Parsed data:', data) // パースされたデータをログ出力
            if (
              data.candidates &&
              data.candidates.length > 0 &&
              data.candidates[0].content &&
              data.candidates[0].content.parts &&
              data.candidates[0].content.parts.length > 0
            ) {
              const text = data.candidates[0].content.parts[0].text
              console.log('Enqueuing text:', text) // エンキューされるテキストをログ出力
              controller.enqueue(text)
            } else {
              console.log('No valid content in chunk') // 有効なコンテンツがない場合のログ
            }
          } catch (e) {
            console.error('Error parsing or processing chunk:', e)
          }
        },
      }),
    )
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    throw error
  }
}

export async function getGeminiModelResponse(
  body: TranslationRequest,
  env: {
    ACCOUNT_ID: string
    GATEWAY_ID: string
    VERTEX_API_KEY: string
    PROJECT_NAME: string
    REGION: string
  },
): Promise<string> {
  const modelId = 'gemini-1.5-pro-001'
  const url = `https://gateway.ai.cloudflare.com/v1/${env.ACCOUNT_ID}/${env.GATEWAY_ID}/google-vertex-ai/v1/projects/${env.PROJECT_NAME}/locations/${env.REGION}/publishers/google/models/${modelId}:generateContent`

  const requestData = {
    contents: [
      {
        role: 'user',
        parts: [{ text: generateSystemMessage(body) }],
      },
    ],
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.VERTEX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      console.log(response)
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()

    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text
    }

    throw new Error('モデルから有効な応答がありませんでした')
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    throw error
  }
}

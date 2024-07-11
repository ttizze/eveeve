import { GoogleGenerativeAI } from '@google/generative-ai'
import { FunctionDeclarationSchemaType } from '@google/generative-ai'
import type { TranslationRequest } from '../../../types/translation-request'
import { generateSystemMessage } from '../utils/generateGeminiMessage'

export async function getGeminiModelResponse(
  apiKey: string | undefined,
  title: string,
  source_text: string,
  target_language: string,
) {
  const genAI = new GoogleGenerativeAI(apiKey ?? '')

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro-latest',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: FunctionDeclarationSchemaType.ARRAY,
        items: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            number: {
              type: FunctionDeclarationSchemaType.NUMBER,
            },
            text: {
              type: FunctionDeclarationSchemaType.STRING,
            },
          },
          required: ['number', 'text'],
        },
      },
    },
  })
  const result = await model.generateContent(
    generateSystemMessage(title, source_text, target_language),
  )
  return result.response.text()
}

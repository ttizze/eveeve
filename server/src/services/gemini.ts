import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
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
  const safetySetting = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro-latest',
    safetySettings: safetySetting,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  })
  const result = await model.generateContent(
    generateSystemMessage(title, source_text, target_language),
  )
  return result.response.text()
}

import {
	GoogleGenerativeAI,
	HarmBlockThreshold,
	HarmCategory,
} from "@google/generative-ai";
import { FunctionDeclarationSchemaType } from "@google/generative-ai";
import { generateSystemMessage } from "./generateGeminiMessage";

export async function getGeminiModelResponse(
	model: string,
	title: string,
	source_text: string,
	target_language: string,
) {
	const genAI = new GoogleGenerativeAI(
		import.meta.env.GEMINI_API_KEY ?? "",
	);
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
	const modelConfig = genAI.getGenerativeModel({
		model: model,
		safetySettings: safetySetting,
		generationConfig: {
			responseMimeType: "application/json",
		},
	});
	const result = await modelConfig.generateContent(
		generateSystemMessage(title, source_text, target_language),
	);
	return result.response.text();
}

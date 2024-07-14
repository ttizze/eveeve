import {
	GoogleGenerativeAI,
	HarmBlockThreshold,
	HarmCategory,
} from "@google/generative-ai";
import { FunctionDeclarationSchemaType } from "@google/generative-ai";
import { generateSystemMessage } from "./generateGeminiMessage";

export async function getGeminiModelResponse(
	title: string,
	source_text: string,
	target_language: string,
) {
	const genAI = new GoogleGenerativeAI(
		import.meta.env.VITE_GEMINI_API_KEY ?? "",
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
	const model = genAI.getGenerativeModel({
		model: "gemini-1.5-pro-latest",
		safetySettings: safetySetting,
		generationConfig: {
			responseMimeType: "application/json",
		},
	});
	const result = await model.generateContent(
		generateSystemMessage(title, source_text, target_language),
	);
	return result.response.text();
}

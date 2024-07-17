import {
	GoogleGenerativeAI,
	HarmBlockThreshold,
	HarmCategory,
} from "@google/generative-ai";
import { generateSystemMessage } from "./generateGeminiMessage";

export async function getGeminiModelResponse(
	geminiApiKey: string,
	model: string,
	title: string,
	source_text: string,
	target_language: string,
) {
	const genAI = new GoogleGenerativeAI(geminiApiKey);
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

export async function validateGeminiApiKey(apiKey: string): Promise<boolean> {
	try {
		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: "gemini-pro" });

		const result = await model.generateContent("Hello, World!");
		const response = await result.response;
		const text = response.text();

		return text.length > 0;
	} catch (error) {
		console.error("Gemini API key validation failed:", error);
		return false;
	}
}

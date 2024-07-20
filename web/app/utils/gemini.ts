import {
	FunctionDeclarationSchemaType,
	GoogleGenerativeAI,
	HarmBlockThreshold,
	HarmCategory,
} from "@google/generative-ai";
import { generateSystemMessage } from "./generateGeminiMessage";
const MAX_RETRIES = 3;

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
			responseSchema: {
				type: FunctionDeclarationSchemaType.ARRAY,
				items: {
					type: FunctionDeclarationSchemaType.OBJECT,
					properties: {
						number: {
							type: FunctionDeclarationSchemaType.INTEGER,
						},
						text: {
							type: FunctionDeclarationSchemaType.STRING,
						},
					},
					required: ["number", "text"],
				},
			},
		},
	});
	let lastError: Error | null = null;

	for (let retryCount = 0; retryCount < MAX_RETRIES; retryCount++) {
		try {
			const result = await modelConfig.generateContent(
				generateSystemMessage(title, source_text, target_language),
			);
			return result.response.text();
		} catch (error: unknown) {
			const typedError = error as Error;
			console.error(
				`Translation attempt ${retryCount + 1} failed:`,
				typedError,
			);
			lastError = typedError;

			if (retryCount < MAX_RETRIES - 1) {
				const delay = 1000 * (retryCount + 1);
				console.log(`Retrying in ${delay / 100} seconds...`);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}
	console.error("Max retries reached. Translation failed.");
	throw lastError || new Error("Translation failed after max retries");
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

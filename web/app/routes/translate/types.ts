import { z } from "zod";

export const geminiApiKeySchema = z.object({
	geminiApiKey: z.string().min(1, "API key is required"),
});

export const urlTranslationSchema = z.object({
	intent: z.literal("translateUrl"),
	url: z
		.string()
		.min(1, { message: "URLを入力してください" })
		.url("有効なURLを入力してください"),
	model: z.string().min(1, "モデルを選択してください"),
});

export const PageVersionTranslationInfoSchema = z.object({
	id: z.number(),
	pageVersionId: z.number(),
	targetLanguage: z.string(),
	translationTitle: z.string(),
});

export const UserAITranslationInfoSchema = z.object({
	id: z.number(),
	userId: z.number(),
	pageVersionId: z.number(),
	targetLanguage: z.string(),
	aiTranslationStatus: z.string(),
	aiTranslationProgress: z.number(),
	lastTranslatedAt: z.string().or(z.date()),
	pageVersion: z.object({
		title: z.string(),
		page: z.object({
			url: z.string(),
		}),
		pageVersionTranslationInfo: z
			.array(PageVersionTranslationInfoSchema)
			.optional(),
	}),
});

export type UserAITranslationInfoItem = z.infer<
	typeof UserAITranslationInfoSchema
>;
export type PageVersionTranslationInfoItem = z.infer<
	typeof PageVersionTranslationInfoSchema
>;

export type NumberedElement = {
	number: number;
	text: string;
};

export const aiModelSchema = z
	.object({
		modelType: z.enum(["openai", "gemini", "claude", "custom"], {
			required_error: "Please select a model type",
		}),
		customModelName: z
			.string()
			.optional()
			.refine((val) => val && val.length > 0, {
				message: "Custom model name is required when selecting a custom model",
			}),
		apiKey: z
			.string({
				required_error: "API key is required",
			})
			.min(1, "API key cannot be empty"),
	})
	.refine(
		(data) => {
			if (data.modelType === "custom") {
				return !!data.customModelName;
			}
			return true;
		},
		{
			message: "Custom model name is required when selecting a custom model",
			path: ["customModelName"],
		},
	);

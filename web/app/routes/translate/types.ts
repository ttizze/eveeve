import { z } from "zod";

export const geminiApiKeySchema = z.object({
	geminiApiKey: z.string().min(1, "API key is required"),
});

export const urlTranslationSchema = z.object({
	url: z
		.string()
		.min(1, { message: "URLを入力してください" })
		.url("有効なURLを入力してください"),
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

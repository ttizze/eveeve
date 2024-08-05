import { z } from "zod";

export const urlTranslationSchema = z.object({
	url: z
		.string()
		.min(1, { message: "URLを入力してください" })
		.url("有効なURLを入力してください"),
	aiModel: z.string().min(1, "モデルを選択してください"),
});

export const PageTranslationInfoSchema = z.object({
	id: z.number(),
	pageId: z.number(),
	targetLanguage: z.string(),
	translationTitle: z.string(),
});

export type PageTranslationInfoItem = z.infer<typeof PageTranslationInfoSchema>;

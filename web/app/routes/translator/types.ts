import { z } from "zod";

export const translationInputSchema = z
	.object({
		url: z.string().url().optional(),
		file: z.instanceof(File).optional(),
		aiModel: z.string(),
	})
	.refine((data) => data.url || data.file, {
		message: "URLまたはファイルのいずれかを指定してください",
	});

export const PageTranslationInfoSchema = z.object({
	id: z.number(),
	pageId: z.number(),
	targetLanguage: z.string(),
	translationTitle: z.string(),
});

export type PageTranslationInfoItem = z.infer<typeof PageTranslationInfoSchema>;

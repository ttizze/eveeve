import { z } from "zod";

export const translationInputSchema = z
	.object({
		url: z.string().url().optional(),
		folder: z.array(z.instanceof(File)).optional(),
		aiModel: z.string(),
	})
	.refine((data) => data.url || (data.folder && data.folder.length > 0), {
		message:
			"URLまたはフォルダ（1つ以上のファイル）のいずれかを指定してください",
	});
export const PageTranslationInfoSchema = z.object({
	id: z.number(),
	pageId: z.number(),
	targetLanguage: z.string(),
	translationTitle: z.string(),
});

export type PageTranslationInfoItem = z.infer<typeof PageTranslationInfoSchema>;

export type NumberedElement = {
	number: number;
	text: string;
};

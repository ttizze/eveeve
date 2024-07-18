import { prisma } from "~/utils/prisma";

export async function getOrCreatePageVersionTranslationInfo(
	pageVersionId: number,
	targetLanguage: string,
	translationTitle: string,
) {
	return await prisma.pageVersionTranslationInfo.upsert({
		where: {
			pageVersionId_targetLanguage: {
				pageVersionId,
				targetLanguage,
			},
		},
		update: {}, // 既存のレコードがある場合は更新しない
		create: {
			pageVersionId,
			targetLanguage,
			translationTitle,
		},
	});
}

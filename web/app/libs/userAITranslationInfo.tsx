import { prisma } from "~/utils/prisma";

export async function getOrCreateUserAITranslationInfo(
	userId: number,
	pageVersionId: number,
	targetLanguage: string,
) {
	try {
		const userAITranslationInfo = await prisma.userAITranslationInfo.upsert({
			where: {
				userId_pageVersionId_targetLanguage: {
					userId,
					pageVersionId,
					targetLanguage,
				},
			},
			update: {
				aiTranslationStatus: "pending",
				aiTranslationProgress: 0,
			},
			create: {
				userId,
				pageVersionId,
				targetLanguage,
				aiTranslationStatus: "pending",
				aiTranslationProgress: 0,
			},
		});
		return userAITranslationInfo;
	} catch (error) {
		console.error("Error in getOrCreateUserAITranslationInfo:", error);
		throw error;
	}
}

export async function updateUserAITranslationInfo(
	userId: number,
	pageVersionId: number,
	targetLanguage: string,
	status: string,
	progress: number,
) {
	return await prisma.userAITranslationInfo.update({
		where: {
			userId_pageVersionId_targetLanguage: {
				userId,
				pageVersionId,
				targetLanguage,
			},
		},
		data: {
			aiTranslationStatus: status,
			aiTranslationProgress: progress,
			lastTranslatedAt: new Date(), // 明示的に更新
		},
	});
}

import { prisma } from "~/utils/prisma";

export async function getOrCreateUserAITranslationInfo(
	userId: number,
	url: string,
	targetLanguage: string,
) {
	try {
		const userAITranslationInfo = await prisma.userAITranslationInfo.upsert({
			where: {
				userId_url_targetLanguage: {
					userId,
					url,
					targetLanguage,
				},
			},
			update: {
				aiTranslationStatus: "pending",
				aiTranslationProgress: 0,
			},
			create: {
				userId,
				url,
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

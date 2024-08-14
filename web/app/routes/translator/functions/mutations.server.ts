import { prisma } from "~/utils/prisma";

export async function createUserAITranslationInfo(
	userId: number,
	pageId: number,
	aiModel: string,
	targetLanguage: string,
) {
	try {
		const userAITranslationInfo = await prisma.userAITranslationInfo.create({
			data: {
				userId,
				pageId,
				aiModel,
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

export async function getOrCreatePage(
	userId: number,
	slug: string,
	title: string,
	content: string,
) {
	const page = await prisma.page.upsert({
		where: {
			slug,
		},
		update: {
			title,
			content,
		},
		create: {
			userId,
			slug,
			title,
			content,
		},
	});

	console.log(`Page upserted: ${page.title}`);
	return page;
}

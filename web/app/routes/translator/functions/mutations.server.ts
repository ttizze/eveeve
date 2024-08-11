import { prisma } from "~/utils/prisma";

export async function getOrCreateUserAITranslationInfo(
	userId: number,
	slug: string,
	targetLanguage: string,
) {
	try {
		const userAITranslationInfo = await prisma.userAITranslationInfo.upsert({
			where: {
				userId_slug_targetLanguage: {
					userId,
					slug,
					targetLanguage,
				},
			},
			update: {
				aiTranslationStatus: "pending",
				aiTranslationProgress: 0,
			},
			create: {
				userId,
				slug,
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

export async function getOrCreatePageId(
	userId: number,
	slug: string,
	title: string,
	numberedContent: string,
): Promise<number> {
	const newPage = await prisma.page.create({
		data: {
			userId,
			title,
			slug,
			content: numberedContent,
		},
	});

	console.log(`New Page created: ${newPage.title}`);
	return newPage.id;
}

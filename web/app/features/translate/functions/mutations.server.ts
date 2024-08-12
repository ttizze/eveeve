import { prisma } from "~/utils/prisma";

export async function getOrCreateAIUser(name: string): Promise<number> {
	const user = await prisma.user.upsert({
		where: { email: `${name}@ai.com` },
		update: {},
		create: {
			email: `${name}@ai.com`,
			isAI: true,
			image: "",
			userName: name,
			displayName: name,
		},
	});

	return user.id;
}

export async function getOrCreatePageTranslationInfo(
	pageId: number,
	targetLanguage: string,
	translationTitle: string,
) {
	return await prisma.pageTranslationInfo.upsert({
		where: {
			pageId_targetLanguage: {
				pageId,
				targetLanguage,
			},
		},
		update: {},
		create: {
			pageId,
			targetLanguage,
			translationTitle,
		},
	});
}

export async function updateUserAITranslationInfo(
	userId: number,
	slug: string,
	targetLanguage: string,
	status: string,
	progress: number,
) {
	return await prisma.userAITranslationInfo.update({
		where: {
			userId_slug_targetLanguage: {
				userId,
				slug,
				targetLanguage,
			},
		},
		data: {
			aiTranslationStatus: status,
			aiTranslationProgress: progress,
			lastTranslatedAt: new Date(),
		},
	});
}

export async function getSourceTexts(pageId: number) {
	return await prisma.sourceText.findMany({
		where: {
			pageId,
		},
	});
}

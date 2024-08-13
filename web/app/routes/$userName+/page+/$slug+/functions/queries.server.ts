import { prisma } from "../../../../../utils/prisma";
import type { PageWithTranslations } from "../types";

export async function fetchPageWithTranslations(
	slug: string,
	userId: number | null,
	targetLanguage: string,
): Promise<PageWithTranslations | null> {
	const page = await prisma.page.findFirst({
		where: { slug },
		select: {
			id: true,
			title: true,
			userId: true,
			slug: true,
			content: true,
			pageTranslationInfo: {
				where: { targetLanguage },
				select: { translationTitle: true },
			},
			sourceTexts: {
				distinct: ["number"],
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					number: true,
					translateTexts: {
						where: { targetLanguage },
						select: {
							id: true,
							text: true,
							point: true,
							createdAt: true,
							user: { select: { displayName: true } },
							votes: {
								where: userId ? { userId } : undefined,
								select: {
									id: true,
									isUpvote: true,
									updatedAt: true,
								},
								orderBy: { updatedAt: "desc" },
								take: 1,
							},
						},
						orderBy: [{ point: "desc" }, { createdAt: "desc" }],
					},
				},
			},
		},
	});

	if (!page) return null;

	return {
		id: page.id,
		title: page.title,
		userId: page.userId,
		translationTitle: page.pageTranslationInfo[0]?.translationTitle,
		slug: page.slug,
		content: page.content,
		sourceTextWithTranslations: page.sourceTexts.map((sourceText) => ({
			sourceTextId: sourceText.id,
			number: sourceText.number,
			translationsWithVotes: sourceText.translateTexts.map((translateText) => ({
				id: translateText.id,
				text: translateText.text,
				point: translateText.point,
				displayName: translateText.user.displayName,
				userVote: translateText.votes[0] || null,
				createdAt: translateText.createdAt,
			})),
		})),
	};
}

export async function fetchPage(pageId: number) {
	const page = await prisma.page.findFirst({
		where: { id: pageId },
	});
	return page;
}

export const getDbUser = async (userId: number) => {
	return await prisma.user.findUnique({ where: { id: userId } });
};

export async function getLastReadDataNumber(userId: number, pageId: number) {
	const readHistory = await prisma.userReadHistory.findUnique({
		where: {
			userId_pageId: {
				userId: userId,
				pageId: pageId,
			},
		},
		select: {
			lastReadDataNumber: true,
		},
	});

	return readHistory?.lastReadDataNumber ?? 0;
}

export async function fetchUserAITranslationInfo(
	pageId: number,
	userId: number,
) {
	const userAITranslationInfo = await prisma.userAITranslationInfo.findMany({
		where: { pageId, userId },
		orderBy: { createdAt: "desc" },
	});
	return userAITranslationInfo;
}

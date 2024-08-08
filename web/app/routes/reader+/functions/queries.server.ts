import { prisma } from "../../../utils/prisma";
import type { LatestPageWithTranslations } from "../types";

export async function fetchLatestPageWithTranslations(
	slug: string,
	userId: number | null,
	targetLanguage: string,
): Promise<LatestPageWithTranslations | null> {
	const page = await prisma.page.findFirst({
		where: { slug },
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			title: true,
			slug: true,
			sourceUrl: true,
			content: true,
			license: true,
			pageSourceTexts: {
				select: {
					sourceText: {
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
									user: { select: { name: true } },
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
				orderBy: {
					sourceText: {
						number: "asc",
					},
				},
			},
		},
	});

	if (!page) return null;

	return {
		id: page.id,
		title: page.title,
		slug: page.slug,
		sourceUrl: page.sourceUrl,
		license: page.license,
		content: page.content,
		sourceTextWithTranslations: page.pageSourceTexts.map(({ sourceText }) => ({
			number: sourceText.number,
			sourceTextId: sourceText.id,
			translationsWithVotes: sourceText.translateTexts.map((translateText) => ({
				id: translateText.id,
				text: translateText.text,
				point: translateText.point,
				userName: translateText.user.name,
				userVote: translateText.votes[0] || null,
			})),
		})),
		userId,
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

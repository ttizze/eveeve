import { prisma } from "~/utils/prisma";
import type { PageWithTranslations } from "../types";

//編集前のデータも記録として保存しておきたいため、sourceTextsは同一numberが複数存在する仕様になっているので､distinctを使用している
export async function fetchPageWithSourceTexts(pageId: number) {
	const pageWithSourceTexts = await prisma.page.findFirst({
		where: { id: pageId },
		select: {
			id: true,
			title: true,
			slug: true,
			content: true,
			createdAt: true,
			sourceTexts: {
				distinct: ["number"],
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					number: true,
					text: true,
				},
			},
		},
	});

	if (!pageWithSourceTexts) return null;

	return pageWithSourceTexts;
}

export async function fetchPageWithTranslations(
	slug: string,
	currentUserId: number | null,
	targetLanguage: string,
): Promise<PageWithTranslations | null> {
	const page = await prisma.page.findFirst({
		where: { slug },
		select: {
			id: true,
			title: true,
			sourceLanguage: true,
			user: { select: { displayName: true, userName: true, icon: true } },
			slug: true,
			content: true,
			createdAt: true,
			isPublished: true,
			isArchived: true,
			sourceTexts: {
				distinct: ["number"],
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					number: true,
					text: true,
					createdAt: true,
					pageId: true,
					translateTexts: {
						where: { targetLanguage, isArchived: false },
						select: {
							id: true,
							text: true,
							point: true,
							createdAt: true,
							user: { select: { displayName: true, userName: true } },
							votes: {
								where: currentUserId ? { userId: currentUserId } : undefined,
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
		sourceLanguage: page.sourceLanguage,
		user: {
			displayName: page.user.displayName,
			userName: page.user.userName,
			icon: page.user.icon,
		},
		slug: page.slug,
		content: page.content,
		createdAt: page.createdAt,
		isPublished: page.isPublished,
		isArchived: page.isArchived,
		sourceTextWithTranslations: page.sourceTexts.map((sourceText) => ({
			sourceText: {
				id: sourceText.id,
				number: sourceText.number,
				text: sourceText.text,
				createdAt: sourceText.createdAt,
				pageId: sourceText.pageId,
			},
			translationsWithVotes: sourceText.translateTexts.map((translateText) => ({
				id: translateText.id,
				text: translateText.text,
				point: translateText.point,
				userName: translateText.user.userName,
				displayName: translateText.user.displayName,
				userVote: translateText.votes[0] || null,
				createdAt: translateText.createdAt,
			})),
		})),
	};
}

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

export async function fetchLatestUserAITranslationInfo(
	pageId: number,
	userId: number,
	targetLanguage: string,
) {
	return await prisma.userAITranslationInfo.findFirst({
		where: { pageId, userId, targetLanguage },
		orderBy: { createdAt: "desc" },
	});
}

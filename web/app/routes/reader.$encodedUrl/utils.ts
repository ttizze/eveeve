import { prisma } from "../../utils/prisma";
import type {
	LatestPageVersionWithTranslations,
	SourceTextTranslations,
} from "./types";

export async function fetchLatestPageVersionWithTranslations(
	url: string,
	userId: number | null,
	language: string,
): Promise<LatestPageVersionWithTranslations | null> {
	const pageVersion = await prisma.pageVersion.findFirst({
		where: { url },
		orderBy: { createdAt: "desc" },
		select: {
			title: true,
			url: true,
			content: true,
			sourceTexts: {
				select: {
					number: true,
					translateTexts: {
						where: { language },
						select: {
							id: true,
							text: true,
							point: true,
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
	});

	if (!pageVersion) return null;

	const translations: SourceTextTranslations[] = pageVersion.sourceTexts.map(
		(sourceText) => ({
			number: sourceText.number,
			translations: sourceText.translateTexts.map((translateText) => ({
				id: translateText.id,
				text: translateText.text,
				point: translateText.point,
				userName: translateText.user.name,
				userVote: translateText.votes[0] || null,
			})),
		}),
	);

	return {
		title: pageVersion.title,
		url: pageVersion.url,
		content: pageVersion.content,
		translations,
		userId,
	};
}

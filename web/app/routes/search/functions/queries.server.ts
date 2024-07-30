import { prisma } from "~/utils/prisma";

export async function searchTitle(query: string) {
	return prisma.pageVersion.findMany({
		where: {
			OR: [
				{ title: { contains: query, mode: "insensitive" } },
				{
					pageVersionTranslationInfo: {
						some: {
							translationTitle: { contains: query, mode: "insensitive" },
						},
					},
				},
			],
		},
		select: {
			id: true,
			title: true,
			url: true,
			page: { select: { url: true } },
			pageVersionTranslationInfo: {
				select: { id: true, targetLanguage: true, translationTitle: true },
			},
		},
	});
}

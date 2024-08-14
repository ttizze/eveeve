import { prisma } from "~/utils/prisma";

export async function searchTitle(query: string) {
	return prisma.page.findMany({
		where: {
			OR: [
				{ title: { contains: query, mode: "insensitive" } },
				{
					pageTranslationInfo: {
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
			slug: true,
			user: {
				select: { userName: true },
			},
			pageTranslationInfo: {
				select: { id: true, targetLanguage: true, translationTitle: true },
			},
		},
	});
}

import { prisma } from "~/utils/prisma";

export async function searchTitle(query: string) {
	return prisma.page.findMany({
		where: {
			AND: [
				{
					isPublished: true,
					isArchived: false,
				},
				{
					OR: [
						{
							sourceTexts: {
								some: {
									text: { contains: query, mode: "insensitive" },
									translateTexts: {
										some: {
											text: { contains: query, mode: "insensitive" },
										},
									},
								},
							},
						},
					],
				},
			],
		},
		orderBy: {
			createdAt: "desc",
		},
		select: {
			id: true,
			slug: true,
			user: {
				select: { userName: true },
			},
			sourceTexts: {
				select: {
					id: true,
					text: true,
					number: true,
					translateTexts: {
						select: { id: true, text: true },
					},
				},
			},
		},
	});
}

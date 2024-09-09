import { prisma } from "~/utils/prisma";

export async function fetchLatestPublicPages(
	limit = 10,
	currentUserId?: number,
) {
	return prisma.page.findMany({
		where: {
			isPublished: true,
			isArchived: false,
		},
		orderBy: {
			createdAt: "desc",
		},
		take: limit,
		include: {
			user: {
				select: {
					userName: true,
					displayName: true,
					icon: true,
				},
			},
			likePages: {
				where: {
					userId: currentUserId,
				},
				select: {
					userId: true,
				},
			},
			_count: {
				select: {
					likePages: true,
				},
			},
		},
	});
}

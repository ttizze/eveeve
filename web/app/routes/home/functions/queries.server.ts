import { prisma } from "~/utils/prisma";

export async function fetchPaginatedPublicPages(
	page = 1,
	pageSize = 9,
	currentUserId?: number,
) {
	const skip = (page - 1) * pageSize;
	const [pages, totalCount] = await Promise.all([
		prisma.page.findMany({
			where: {
				isPublished: true,
				isArchived: false,
			},
			orderBy: {
				createdAt: "desc",
			},
			skip,
			take: pageSize,
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
		}),
		prisma.page.count({
			where: {
				isPublished: true,
				isArchived: false,
			},
		}),
	]);

	return {
		pages,
		totalPages: Math.ceil(totalCount / pageSize),
		currentPage: page,
	};
}

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
				sourceTexts: {
					some: {
						number: 0,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			skip,
			take: pageSize,
			select: {
				id: true,
				slug: true,
				createdAt: true,
				user: {
					select: {
						userName: true,
						displayName: true,
						icon: true,
					},
				},
				sourceTexts: {
					where: {
						number: 0,
					},
					select: {
						number: true,
						text: true,
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
	const pagesWithTitle = pages.map((page) => {
		return {
			...page,
			title: page.sourceTexts.filter((item) => item.number === 0)[0].text,
		};
	});

	return {
		pages: pagesWithTitle,
		totalPages: Math.ceil(totalCount / pageSize),
		currentPage: page,
	};
}

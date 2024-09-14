import { prisma } from "~/utils/prisma";
import { sanitizeUser } from "~/utils/sanitizeUser";
import type { PageListItem, sanitizedUserWithPages } from "../types";

export async function fetchSanitizedUserWithPages(
	userName: string,
	isOwnProfile: boolean,
): Promise<sanitizedUserWithPages | null> {
	const user = await prisma.user.findUnique({
		where: { userName },
		include: {
			pages: {
				select: {
					id: true,
					title: true,
					slug: true,
					isPublished: true,
					createdAt: true,
				},
				where: {
					isArchived: false,
					...(isOwnProfile ? {} : { isPublished: true }),
				},
				orderBy: { createdAt: "desc" },
			},
		},
	});

	if (!user) return null;

	const pages: PageListItem[] = user.pages.map((page) => ({
		...page,
	}));
	return {
		...sanitizeUser(user),
		pages,
	};
}

export async function fetchPageById(pageId: number) {
	return prisma.page.findUnique({
		where: { id: pageId },
	});
}

import type { Page } from "@prisma/client";
import { sanitizeUser } from "~/utils/auth.server";
import { prisma } from "~/utils/prisma";
import type { sanitizedUserWithPages } from "../types";
import { stripHtmlTags } from "../utils/stripHtmlTags";

export async function getSanitizedUserWithPages(
	userName: string,
	isOwnProfile: boolean,
): Promise<sanitizedUserWithPages | null> {
	const user = await prisma.user.findUnique({
		where: { userName },
		include: {
			pages: {
				where: {
					isArchived: false,
					...(isOwnProfile ? {} : { isPublished: true }),
				},
				orderBy: { createdAt: "desc" },
			},
		},
	});

	if (!user) return null;

	const pages: Page[] = user.pages.map((page) => ({
		...page,
		content: stripHtmlTags(page.content).slice(0, 200),
	}));
	return {
		...sanitizeUser(user),
		pages,
	};
}

export async function getPageById(pageId: number) {
	return prisma.page.findUnique({
		where: { id: pageId },
	});
}
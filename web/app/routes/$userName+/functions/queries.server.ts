import type { Page } from "@prisma/client";
import { sanitizeUser } from "~/utils/auth.server";
import { prisma } from "~/utils/prisma";
import type { sanitizedUserWithPages } from "../types";
export async function getSanitizedUserWithPages(
	userName: string,
): Promise<sanitizedUserWithPages | null> {
	const user = await prisma.user.findUnique({
		where: { userName },
		include: {
			pages: {
				orderBy: { createdAt: "desc" },
				take: 10,
			},
		},
	});

	if (!user) return null;

	const pages: Page[] = user.pages;

	return {
		...sanitizeUser(user),
		pages,
	};
}

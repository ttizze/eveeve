import type { Page } from "@prisma/client";
import type { SafeUser } from "~/types";
import { prisma } from "~/utils/prisma";
import type { UserWithPages } from "../types";

export async function getUserWithPages(
	userName: string,
): Promise<UserWithPages | null> {
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

	const safeUser: SafeUser = {
		id: user.id,
		userName: user.userName,
		displayName: user.displayName,
		plan: user.plan,
		totalPoints: user.totalPoints,
		isAI: user.isAI,
		provider: user.provider,
		image: user.image,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};

	const pages: Page[] = user.pages;

	return {
		...safeUser,
		pages,
	};
}

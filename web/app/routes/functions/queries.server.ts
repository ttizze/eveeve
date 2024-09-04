import type { User } from "@prisma/client";
import { prisma } from "~/utils/prisma";

export async function getNonSanitizedUserbyUserName(
	userName: string,
): Promise<User | null> {
	return await prisma.user.findUnique({
		where: { userName },
	});
}

export async function fetchAllPublishedPages() {
	return prisma.page.findMany({
		where: { isPublished: true, isArchived: false },
		select: {
			id: true,
			title: true,
			slug: true,
			createdAt: true,
			updatedAt: true,
			user: { select: { userName: true } },
		},
	});
}

export async function fetchAllUsersName() {
	return prisma.user.findMany({
		select: {
			userName: true,
			updatedAt: true,
		},
	});
}

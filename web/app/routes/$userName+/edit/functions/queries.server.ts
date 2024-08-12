import type { Page } from "@prisma/client";
import type { SafeUser } from "~/types";
import { prisma } from "~/utils/prisma";
import type { User } from "@prisma/client";

export async function getUserByUserName(userName: string) {
	return prisma.user.findUnique({
		where: {
			userName,
		},
	});
}

export async function updateUser(userId: number, data: Partial<User>) {
	return prisma.user.update({
		where: {
			id: userId,
		},
		data,
	});
}
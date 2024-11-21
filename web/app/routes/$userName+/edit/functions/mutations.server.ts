import type { User } from "@prisma/client";
import { prisma } from "~/utils/prisma";
import { isUserNameTaken } from "./queries.server";

export async function updateUser(userId: number, data: Partial<User>) {
	return prisma.$transaction(async (tx) => {
		const currentUser = await tx.user.findUnique({
			where: { id: userId },
		});
		if (!currentUser) {
			throw new Error("User not found");
		}
		const isNameTaken = await isUserNameTaken(currentUser.userName);
		if (isNameTaken && data.userName !== currentUser.userName) {
			throw new Error("This name is already taken.");
		}
		return tx.user.update({
			where: {
				id: userId,
			},
			data,
		});
	});
}

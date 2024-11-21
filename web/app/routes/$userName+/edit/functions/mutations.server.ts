import type { User } from "@prisma/client";
import { prisma } from "~/utils/prisma";

export async function updateUser(userId: number, data: Partial<User>) {
	return prisma.user.update({
		where: {
			id: userId,
		},
		data,
	});
}

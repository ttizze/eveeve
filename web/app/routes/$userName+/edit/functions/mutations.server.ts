import type { User } from "@prisma/client";
import { prisma } from "~/utils/prisma";
export async function updateUser(userName: string, data: Partial<User>) {
	return prisma.user.update({
		where: {
			userName,
		},
		data,
	});
}

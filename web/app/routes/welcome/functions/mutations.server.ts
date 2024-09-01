import type { User } from "@prisma/client";
import { prisma } from "~/utils/prisma";

export async function updateUserName(
	userId: number,
	userName: string,
): Promise<User> {
	return await prisma.user.update({
		where: { id: userId },
		data: { userName, displayName: userName },
	});
}

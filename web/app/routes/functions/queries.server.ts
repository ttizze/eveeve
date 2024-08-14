import type { User } from "@prisma/client";
import { prisma } from "~/utils/prisma";

export async function getNonSanitizedUserbyUserName(
	userName: string,
): Promise<User | null> {
	return await prisma.user.findUnique({
		where: { userName },
	});
}

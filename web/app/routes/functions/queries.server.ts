import type { User } from "@prisma/client";
import { prisma } from "~/utils/prisma";

export async function getNonSanitizedUserbyUserName(
	userName: string,
): Promise<User> {
	const nonSanitizedUser = await prisma.user.findUnique({
		where: { userName },
	});
	if (nonSanitizedUser === null) {
		throw Error("user not found");
	}
	return nonSanitizedUser;
}

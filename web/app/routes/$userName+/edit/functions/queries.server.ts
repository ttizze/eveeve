import type { SanitizedUser } from "~/types";
import { prisma } from "~/utils/prisma";
import { sanitizeUser } from "~/utils/sanitizeUser";

export async function getUserByUserName(
	userName: string,
): Promise<SanitizedUser | null> {
	const user = await prisma.user.findUnique({
		where: { userName },
	});
	if (!user) return null;
	return sanitizeUser(user);
}

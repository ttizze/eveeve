import { prisma } from "~/utils/prisma";

export async function updateUserName(
	userId: number,
	userName: string,
): Promise<void> {
	await prisma.user.update({
		where: { id: userId },
		data: { userName },
	});
}

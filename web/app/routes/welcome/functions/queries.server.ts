import { prisma } from "~/utils/prisma";

export async function isUserNameTaken(userName: string): Promise<boolean> {
	const existingUser = await prisma.user.findUnique({
		where: { userName },
	});
	return !!existingUser;
}

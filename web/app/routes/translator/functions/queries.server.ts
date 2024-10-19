import { prisma } from "~/utils/prisma";

export const getDbUser = async (userId: number) => {
	return await prisma.user.findUnique({ where: { id: userId } });
};

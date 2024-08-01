import { prisma } from "~/utils/prisma";

export const getDbUser = async (userId: number) => {
	return await prisma.user.findUnique({ where: { id: userId } });
};

export async function getOrCreateAIUser(name: string): Promise<number> {
	const user = await prisma.user.upsert({
		where: { email: `${name}@ai.com` },
		update: {},
		create: { name, email: `${name}@ai.com`, isAI: true, image: "" },
	});

	return user.id;
}

import { prisma } from "./prisma";

export async function getOrCreateAIUser(name: string): Promise<number> {
	const user = await prisma.user.upsert({
		where: { email: `${name}@ai.com` },
		update: {},
		create: { name, email: `${name}@ai.com`, isAI: true},
	});

	return user.id;
}

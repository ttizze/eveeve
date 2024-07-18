import { prisma } from "../utils/prisma";

export async function getOrCreatePageId(url: string): Promise<number> {
	const page = await prisma.page.upsert({
		where: { url },
		update: {},
		create: { url },
	});
	return page.id;
}

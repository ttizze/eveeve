import { prisma } from "~/utils/prisma";

export async function getPageBySlug(slug: string) {
	return await prisma.page.findUnique({ where: { slug } });
}

export async function getPageWithSourceTexts(slug: string) {
	return await prisma.page.findUnique({
		where: { slug },
		include: {
			sourceTexts: {
				select: {
					id: true,
					number: true,
				},
			},
		},
	});
}

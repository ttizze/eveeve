import { prisma } from "~/utils/prisma";

export async function getPageBySlug(slug: string) {
	return await prisma.page.findUnique({
		where: { slug },
		include: {
			tagPages: {
				include: {
					tag: true,
				},
			},
		},
	});
}

export async function getTitleSourceTextId(slug: string) {
	const titleSourceText = await prisma.page.findFirst({
		where: { slug },
		select: {
			sourceTexts: {
				where: {
					number: 0,
				},
				select: {
					id: true,
				},
				orderBy: {
					createdAt: "desc",
				},
				take: 1,
			},
		},
	});
	return titleSourceText?.sourceTexts[0]?.id || null;
}

export async function getAllTags() {
	return await prisma.tag.findMany();
}

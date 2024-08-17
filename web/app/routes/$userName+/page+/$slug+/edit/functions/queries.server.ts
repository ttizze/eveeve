import { prisma } from "~/utils/prisma";

export const getDbUser = async (userId: number) => {
	return await prisma.user.findUnique({ where: { id: userId } });
};

export const listUserAiTranslationInfo = async (
	userId: number,
	targetLanguage: string,
) => {
	return await prisma.userAITranslationInfo.findMany({
		where: {
			userId: userId,
			targetLanguage,
		},
		orderBy: {
			createdAt: "desc",
		},
		take: 10,
	});
};

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

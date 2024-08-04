import { z } from "zod";
import { prisma } from "~/utils/prisma";
import { UserAITranslationInfoSchema } from "../types";

export const getDbUser = async (userId: number) => {
	return await prisma.user.findUnique({ where: { id: userId } });
};

export const listUserAiTranslationInfo = async (
	userId: number,
	targetLanguage: string,
) => {
	const rawTranslationInfo = await prisma.userAITranslationInfo.findMany({
		where: {
			userId: userId,
			targetLanguage,
		},
		include: {
			pageVersion: {
				select: {
					title: true,
					page: {
						select: {
							url: true,
						},
					},
					pageVersionTranslationInfo: {
						where: {
							targetLanguage,
						},
					},
				},
			},
		},
		orderBy: {
			lastTranslatedAt: "desc",
		},
		take: 10,
	});

	return z.array(UserAITranslationInfoSchema).parse(rawTranslationInfo);
};

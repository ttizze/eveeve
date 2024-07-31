import { prisma } from "~/utils/prisma";

export const updateGeminiApiKey = async (
	userId: number,
	geminiApiKey: string,
) => {
	await prisma.user.update({
		where: { id: userId },
		data: { geminiApiKey },
	});
};

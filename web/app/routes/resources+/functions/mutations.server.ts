import { json } from "@remix-run/node";
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

export const deleteOwnTranslation = async (
	currentUserName: string,
	translationId: number,
) => {
	const translation = await prisma.translateText.findUnique({
		where: { id: translationId },
		select: { user: true },
	});
	if (!translation) {
		return json({ error: "Translation not found" }, { status: 404 });
	}
	if (translation.user.userName !== currentUserName) {
		return json({ error: "Unauthorized" }, { status: 403 });
	}
	await prisma.translateText.update({
		where: { id: translationId },
		data: { isArchived: true },
	});
};

export async function addUserTranslation(
	sourceTextId: number,
	text: string,
	userId: number,
	targetLanguage: string,
) {
	const sourceText = await prisma.sourceText.findUnique({
		where: { id: sourceTextId },
	});

	if (sourceText) {
		await prisma.translateText.create({
			data: {
				targetLanguage,
				text,
				sourceTextId,
				userId,
			},
		});
	}

	return json({ success: true });
}

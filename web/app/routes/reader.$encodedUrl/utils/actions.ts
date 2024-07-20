import { json } from "@remix-run/node";
import { prisma } from "~/utils/prisma";

export async function handleVoteAction(formData: FormData, userId: number) {
	const translateTextId = Number(formData.get("translateTextId"));
	const isUpvote = formData.get("isUpvote") === "true";

	await prisma.$transaction(async (tx) => {
		const existingVote = await tx.vote.findUnique({
			where: {
				translateTextId_userId: { translateTextId, userId },
			},
		});

		if (existingVote) {
			if (existingVote.isUpvote === isUpvote) {
				await tx.vote.delete({ where: { id: existingVote.id } });
				await tx.translateText.update({
					where: { id: translateTextId },
					data: { point: { increment: isUpvote ? -1 : 1 } },
				});
			} else {
				await tx.vote.update({
					where: { id: existingVote.id },
					data: { isUpvote },
				});
				await tx.translateText.update({
					where: { id: translateTextId },
					data: { point: { increment: isUpvote ? 2 : -2 } },
				});
			}
		} else {
			await tx.vote.create({
				data: { userId, translateTextId, isUpvote },
			});
			await tx.translateText.update({
				where: { id: translateTextId },
				data: { point: { increment: isUpvote ? 1 : -1 } },
			});
		}
	});

	return json({ success: true });
}

export async function handleAddTranslationAction(
	formData: FormData,
	userId: number,
	targetLanguage: string,
) {
	const sourceTextId = Number(formData.get("sourceTextId"));
	const text = String(formData.get("text"));

	const sourceText = await prisma.sourceText.findUnique({
		where: { id: sourceTextId },
		include: { page: true },
	});

	if (sourceText) {
		await prisma.translateText.create({
			data: {
				targetLanguage,
				text,
				sourceTextId,
				pageId: sourceText.page.id,
				userId,
			},
		});
	}

	return json({ success: true });
}

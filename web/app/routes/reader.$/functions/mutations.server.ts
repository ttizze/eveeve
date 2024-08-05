import { json } from "@remix-run/node";
import { prisma } from "~/utils/prisma";

export async function handleVoteAction(
	translateTextId: number,
	isUpvote: boolean,
	userId: number,
) {
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

export async function updateUserReadHistory(
	userId: number,
	pageId: number,
	lastReadDataNumber: number,
) {
	await prisma.userReadHistory.upsert({
		where: {
			userId_pageId: {
				userId: userId,
				pageId: pageId,
			},
		},
		update: {
			lastReadDataNumber: lastReadDataNumber,
			readAt: new Date(),
		},
		create: {
			userId: userId,
			pageId: pageId,
			lastReadDataNumber: lastReadDataNumber,
		},
	});
}

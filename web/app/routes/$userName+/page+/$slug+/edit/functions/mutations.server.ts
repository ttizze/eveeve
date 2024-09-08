import { prisma } from "~/utils/prisma";
import type { TextElementInfo } from "../types";

export async function createOrUpdatePage(
	userId: number,
	slug: string,
	title: string,
	content: string,
	isPublished: boolean,
	sourceLanguage: string,
) {
	const page = await prisma.page.upsert({
		where: {
			slug,
		},
		update: {
			title,
			content,
			isPublished,
			sourceLanguage,
		},
		create: {
			userId,
			slug,
			title,
			content,
			isPublished,
			sourceLanguage,
		},
	});

	return page;
}

export async function createOrUpdateSourceTexts(
	textElements: TextElementInfo[],
	pageId: number,
): Promise<Array<{ number: number; sourceTextId: number }>> {
	return await prisma.$transaction(async (tx) => {
		const results = await Promise.all(
			textElements.map(async (element) => {
				if (element.sourceTextId) {
					const existingSourceText = await tx.sourceText.findUnique({
						where: { id: element.sourceTextId, pageId },
					});
					if (existingSourceText) {
						const sourceText = await tx.sourceText.update({
							where: { id: element.sourceTextId },
							data: {
								number: element.number,
								text: element.text,
							},
						});
						return { number: element.number, sourceTextId: sourceText.id };
					}
				}
				const sourceText = await tx.sourceText.create({
					data: {
						pageId,
						number: element.number,
						text: element.text,
					},
				});
				return { number: element.number, sourceTextId: sourceText.id };
			}),
		);
		return results;
	});
}

export async function upsertTags(
	tags: { id?: number; name: string }[],
	pageId: number,
) {
	const upsertPromises = tags.map(async (tag) => {
		const upsertedTag = await prisma.tag.upsert({
			where: { name: tag.name },
			update: {},
			create: { name: tag.name },
		});

		await prisma.tagPage.upsert({
			where: {
				tagId_pageId: {
					tagId: upsertedTag.id,
					pageId: pageId,
				},
			},
			update: {},
			create: {
				tagId: upsertedTag.id,
				pageId: pageId,
			},
		});

		return upsertedTag;
	});

	const updatedTags = await Promise.all(upsertPromises);

	const tagIdsToKeep = updatedTags.map((tag) => tag.id);
	await prisma.tagPage.deleteMany({
		where: {
			pageId,
			tagId: { notIn: tagIdsToKeep },
		},
	});

	return updatedTags;
}

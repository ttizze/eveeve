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
					const sourceText = await tx.sourceText.update({
						where: { id: element.sourceTextId },
						data: {
							number: element.number,
							text: element.text,
						},
					});
					return { number: element.number, sourceTextId: sourceText.id };
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

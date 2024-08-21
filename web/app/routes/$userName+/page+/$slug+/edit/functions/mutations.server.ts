import { prisma } from "~/utils/prisma";
import type { NumberedElement } from "../types";

export async function createOrUpdatePage(
	userId: number,
	slug: string,
	title: string,
	content: string,
	isPublished: boolean,
) {
	const page = await prisma.page.upsert({
		where: {
			slug,
		},
		update: {
			title,
			content,
			isPublished,
		},
		create: {
			userId,
			slug,
			title,
			content,
			isPublished,
		},
	});

	return page;
}
//sourceTextIdがあればupdate、なければcreate
export async function createOrUpdateSourceTexts(
	numberedElements: NumberedElement[],
	pageId: number,
): Promise<Array<{ number: number; sourceTextId: number }>> {
	return await prisma.$transaction(async (tx) => {
		const results = await Promise.all(
			numberedElements.map(async (element) => {
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

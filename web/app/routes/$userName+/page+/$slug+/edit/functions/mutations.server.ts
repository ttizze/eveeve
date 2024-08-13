import { prisma } from "~/utils/prisma";
import type { NumberedElement } from "../types";

export async function getOrCreatePage(
	userId: number,
	slug: string,
	title: string,
	content: string,
) {
	const page = await prisma.page.upsert({
		where: {
			slug,
		},
		update: {
			title,
			content,
		},
		create: {
			userId,
			slug,
			title,
			content,
		},
	});

	return page;
}

export async function createOrSkipSourceTexts(
	numberedElements: NumberedElement[],
	pageId: number,
) {
	await prisma.sourceText.createMany({
		data: numberedElements.map((element) => ({
			pageId,
			number: element.number,
			text: element.text,
		})),
		skipDuplicates: true,
	});
}

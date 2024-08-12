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

	console.log(`Page upserted: ${page.title}`);
	return page;
}

export async function createOrUpdateSourceTexts(
	numberedElements: NumberedElement[],
	pageId: number,
) {
	const sourceTexts = numberedElements.map((element) => ({
		pageId,
		number: element.number,
		text: element.text,
	}));

	await prisma.sourceText.createMany({
		data: sourceTexts,
		skipDuplicates: true,
	});

	for (const element of numberedElements) {
		await prisma.sourceText.update({
			where: { pageId_number: { pageId, number: element.number } },
			data: { text: element.text },
		});
	}

	return prisma.sourceText.findMany({
		where: { pageId },
		select: { id: true, number: true },
	});
}

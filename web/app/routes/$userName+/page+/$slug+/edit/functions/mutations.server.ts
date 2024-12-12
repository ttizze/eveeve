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
			content,
			isPublished,
			sourceLanguage,
		},
		create: {
			userId,
			slug,
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
	try {
		return await prisma.$transaction(
			async (tx) => {
				// numberの重複を避けるため、一旦既存のsourceTextのnumberを-1倍にする
				await tx.sourceText.updateMany({
					where: { pageId },
					data: { number: { multiply: -1 } },
				});

				const upsertPromises = textElements.map((element) =>
					tx.sourceText.upsert({
						where: { id: element.sourceTextId ?? 0 },
						update: {
							number: element.number,
							text: element.text,
						},
						create: {
							pageId,
							number: element.number,
							text: element.text,
						},
					}),
				);

				const updatedOrCreatedSourceTexts = await Promise.all(upsertPromises);
				const upsertedIds = updatedOrCreatedSourceTexts.map((st) => st.id);

				// 作成または更新したsourceText以外を削除
				await tx.sourceText.deleteMany({
					where: {
						pageId,
						id: { notIn: upsertedIds },
					},
				});

				return updatedOrCreatedSourceTexts.map((st) => ({
					number: st.number,
					sourceTextId: st.id,
				}));
			},
			{
				timeout: 30000, // 30秒まで待つ
			},
		);
	} catch (error) {
		console.error("Error in createOrUpdateSourceTexts:", error);
		throw error;
	}
}

export async function upsertTags(tags: string[], pageId: number) {
	const upsertPromises = tags.map(async (tagName) => {
		const upsertedTag = await prisma.tag.upsert({
			where: { name: tagName },
			update: {},
			create: { name: tagName },
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

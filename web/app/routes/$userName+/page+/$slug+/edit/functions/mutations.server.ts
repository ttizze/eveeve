import { prisma } from "~/utils/prisma";
import { generateHashForText } from "../utils/generateHashForText";

export async function upsertPageWithHtml(
	pageSlug: string,
	html: string,
	userId: number,
	sourceLanguage: string,
	isPublished: boolean,
) {
	return await prisma.page.upsert({
		where: { slug: pageSlug },
		update: { content: html, sourceLanguage, isPublished },
		create: {
			slug: pageSlug,
			content: html,
			userId,
			isPublished,
			sourceLanguage,
		},
	});
}

export async function upsertTitle(pageSlug: string, title: string) {
	const page = await prisma.page.findUnique({ where: { slug: pageSlug } });
	if (!page) return;
	const titleHash = generateHashForText(title, 1);
	await prisma.page.update({
		where: { id: page.id },
		data: { title: title },
	});
	return await prisma.sourceText.upsert({
		where: {
			pageId_textAndOccurrenceHash: {
				pageId: page.id,
				textAndOccurrenceHash: titleHash,
			},
		},
		update: { text: title },
		create: {
			pageId: page.id,
			textAndOccurrenceHash: titleHash,
			text: title,
			number: 0,
		},
	});
}

export async function upsertTags(tags: string[], pageId: number) {
	// 重複タグを除去
	const uniqueTags = Array.from(new Set(tags));

	const upsertPromises = uniqueTags.map(async (tagName) => {
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

export async function synchronizePageSourceTexts(
	pageId: number,
	allTextsData: {
		text: string;
		textAndOccurrenceHash: string;
		number: number;
	}[],
): Promise<Map<string, number>> {
	return await prisma.$transaction(async (tx) => {
		// 1. 現在のDB上のソーステキストを取得
		const existingSourceTexts = await tx.sourceText.findMany({
			where: { pageId },
			select: { id: true, textAndOccurrenceHash: true, number: true }, // 必要なフィールドのみ選択
		});

		// 2. existingMap を部分オブジェクトで初期化
		const existingMap: Map<string, { id: number; number: number }> = new Map(
			existingSourceTexts.map((t) => [
				t.textAndOccurrenceHash as string,
				{ id: t.id, number: t.number },
			]),
		);

		const newHashes = new Set(allTextsData.map((t) => t.textAndOccurrenceHash));

		// 3. 不要テキストの一括削除
		const hashesToDelete = existingSourceTexts
			.filter((t) => !newHashes.has(t.textAndOccurrenceHash as string))
			.map((t) => t.id);

		if (hashesToDelete.length > 0) {
			await tx.sourceText.deleteMany({
				where: { id: { in: hashesToDelete } },
			});
		}

		// 4. 既存テキストのnumberフィールドにオフセットを適用
		const OFFSET = 1_000_000;
		const existingIds = existingSourceTexts.map((t) => t.id);

		if (existingIds.length > 0) {
			await tx.sourceText.updateMany({
				where: { id: { in: existingIds } },
				data: { number: { increment: OFFSET } },
			});
		}

		// 5. 既存テキストのnumberフィールドを更新
		const updatePromises = allTextsData
			.filter((t) => existingMap.has(t.textAndOccurrenceHash))
			.map((t) =>
				tx.sourceText.update({
					where: { id: existingMap.get(t.textAndOccurrenceHash)?.id },
					data: { number: t.number },
				}),
			);

		if (updatePromises.length > 0) {
			await Promise.all(updatePromises);
		}

		// 6. 新規テキストの一括挿入
		const newInserts = allTextsData
			.filter((t) => !existingMap.has(t.textAndOccurrenceHash))
			.map((t) => ({
				pageId,
				textAndOccurrenceHash: t.textAndOccurrenceHash,
				text: t.text,
				number: t.number,
			}));

		if (newInserts.length > 0) {
			await tx.sourceText.createMany({
				data: newInserts,
				skipDuplicates: true, // 必要に応じて重複をスキップ
			});

			// 挿入されたデータを再取得して existingMap を更新
			const insertedSourceTexts = await tx.sourceText.findMany({
				where: {
					pageId,
					textAndOccurrenceHash: {
						in: newInserts.map((insert) => insert.textAndOccurrenceHash),
					},
				},
				select: { textAndOccurrenceHash: true, id: true },
			});

			for (const sourceText of insertedSourceTexts) {
				if (!sourceText.textAndOccurrenceHash) continue;
				existingMap.set(sourceText.textAndOccurrenceHash, {
					id: sourceText.id,
					number: 0,
				});
			}
		}

		// 7. hashToId の構築
		const hashToId = new Map<string, number>();
		existingMap.forEach((value, key) => {
			hashToId.set(key, value.id);
		});

		return hashToId;
	});
}

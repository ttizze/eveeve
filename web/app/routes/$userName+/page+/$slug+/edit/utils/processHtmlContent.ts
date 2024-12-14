import crypto from "node:crypto";
import type { Element, Properties, Root, RootContent, Text } from "hast";
import rehypeParse from "rehype-parse";
import rehypeRaw from "rehype-raw";
import rehypeRemark from "rehype-remark";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { Plugin } from "unified";
import type { Parent } from "unist";
import { visit } from "unist-util-visit";
import type { VFile } from "vfile";
import { prisma } from "~/utils/prisma";

function generateHashForText(text: string, occurrence: number): string {
	return crypto
		.createHash("sha256")
		.update(`${text}|${occurrence}`)
		.digest("hex");
}

async function fullReparseUpdate(
	pageId: number,
	allTextsData: {
		text: string;
		hash: string;
		number: number;
	}[],
) {
	return await prisma.$transaction(async (tx) => {
		// 現在のDB上のソーステキストを取得
		const existingSourceTexts = await tx.sourceText.findMany({
			where: { pageId },
		});

		const existingMap = new Map(
			existingSourceTexts.map((t) => [t.hash as string, t]),
		);

		const newHashes = new Set(allTextsData.map((t) => t.hash));

		// 1. 不要テキスト削除
		const deletions = [];
		for (const [h, ex] of existingMap) {
			if (!newHashes.has(h)) {
				deletions.push(tx.sourceText.delete({ where: { id: ex.id } }));
				existingMap.delete(h);
			}
		}
		if (deletions.length > 0) {
			await Promise.all(deletions);
		}

		const hashToId = new Map<string, number>();

		// 2. 一時的なオフセットを適用して既存テキストのnumberを変更
		const OFFSET = 1_000_000;
		const updateTemporary = Array.from(existingMap.values()).map((ex) =>
			tx.sourceText.update({
				where: { id: ex.id },
				data: { number: ex.number + OFFSET },
			}),
		);
		await Promise.all(updateTemporary);

		// 3. 既存テキストUPDATE（既に存在するhashはnumberを更新）
		const updates = [];
		for (const textData of allTextsData) {
			const existingText = existingMap.get(textData.hash);
			if (existingText) {
				updates.push(
					tx.sourceText.update({
						where: { id: existingText.id },
						data: { number: textData.number },
					}),
				);
				hashToId.set(textData.hash, existingText.id);
			}
		}
		if (updates.length > 0) {
			try {
				await Promise.all(updates);
			} catch (error) {
				console.error("Error during updating sourceTexts:", error);
				throw error;
			}
		}

		// 4. 新規テキストINSERT（既存にないhashは新規作成）
		const inserts = [];
		for (const textData of allTextsData) {
			if (!hashToId.has(textData.hash)) {
				inserts.push(
					tx.sourceText.create({
						data: {
							pageId,
							hash: textData.hash,
							text: textData.text,
							number: textData.number,
						},
						select: { id: true },
					}),
				);
			}
		}
		const insertedTexts = await Promise.all(inserts);
		insertedTexts.forEach((sourceText, index) => {
			const hash = allTextsData[inserts.length - index - 1].hash;
			hashToId.set(hash, sourceText.id);
		});

		return hashToId;
	});
}

async function upsertPageWithHtml(
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

const BLOCK_LEVEL_TAGS = new Set([
	"p",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"li",
	"td",
	"th",
]);

function extractTextFromHAST(node: Parent): string {
	let result = "";
	visit(node, "text", (textNode: RootContent) => {
		if (textNode.type === "text") {
			const trimmedText = (textNode as Text).value.trim();
			if (trimmedText) {
				result += result ? ` ${trimmedText}` : trimmedText;
			}
		}
	});
	return result;
}
export function rehypeAddDataId(pageId: number): Plugin<[], Root> {
	return function attacher() {
		return async (tree: Root, file: VFile) => {
			const textOccurrenceMap = new Map<string, number>();

			interface BlockInfo {
				element: Element;
				text: string;
				hash: string;
			}

			const blocks: BlockInfo[] = [];

			// 全ての"element"ノードを訪問
			visit(tree, "element", (node: Element) => {
				if (BLOCK_LEVEL_TAGS.has(node.tagName)) {
					const blockText = extractTextFromHAST(node);
					if (!blockText) return;

					const currentCount = (textOccurrenceMap.get(blockText) ?? 0) + 1;
					textOccurrenceMap.set(blockText, currentCount);

					const hash = generateHashForText(blockText, currentCount);

					blocks.push({
						element: node,
						text: blockText,
						hash: hash,
					});
				}
			});

			const allTextsForDb = blocks.map((block, index) => ({
				text: block.text,
				hash: block.hash,
				number: index + 1,
			}));

			const hashToId = await fullReparseUpdate(pageId, allTextsForDb);

			// 各ブロック要素を<span data-id="...">で子要素全体を包む
			for (const block of blocks) {
				const sourceTextId = hashToId.get(block.hash);
				if (!sourceTextId) continue;

				const spanNode: Element = {
					type: "element",
					tagName: "span",
					properties: {
						"data-source-text-id": sourceTextId.toString(),
					} as Properties,
					children: block.element.children,
				};

				block.element.children = [spanNode];
			}
		};
	};
}

const upsertTitle = async (pageSlug: string, title: string) => {
	const page = await prisma.page.findUnique({ where: { slug: pageSlug } });
	if (!page) return;
	const titleHash = generateHashForText(title, 1);
	return await prisma.sourceText.upsert({
		where: { pageId_hash: { pageId: page.id, hash: titleHash } },
		update: { text: title },
		create: { pageId: page.id, hash: titleHash, text: title, number: 0 },
	});
};

export async function processHtmlContent(
	title: string,
	htmlInput: string,
	pageSlug: string,
	userId: number,
	sourceLanguage: string,
	isPublished: boolean,
) {
	// HTML入力に対応するpageレコードを作成・更新
	const page = await upsertPageWithHtml(
		pageSlug,
		htmlInput,
		userId,
		sourceLanguage,
		isPublished,
	);
	// HTML → HAST → MDAST → remarkAddDataId適用 → HTMLへの変換

	const file = await unified()
		.use(rehypeParse, { fragment: true }) // HTMLをHASTに
		.use(rehypeRemark) // HAST→MDAST
		.use(remarkGfm) // GFM拡張
		.use(remarkRehype, { allowDangerousHtml: true }) // MDAST→HAST
		.use(rehypeAddDataId(page.id)) // HAST上でdata-idを付与
		.use(rehypeRaw) // 生HTMLを処理
		.use(rehypeStringify, { allowDangerousHtml: true }) // HAST→HTML
		.process(htmlInput);

	const htmlContent = String(file);
	await upsertPageWithHtml(
		pageSlug,
		htmlContent,
		userId,
		sourceLanguage,
		isPublished,
	);
	const titleSourceText = await upsertTitle(pageSlug, title);
	return page;
}

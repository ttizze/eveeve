import crypto from "node:crypto";
import type { Element, Root, RootContent, Text } from "hast";
import type { Properties } from "hast";
import rehypeParse from "rehype-parse";
import rehypeRaw from "rehype-raw";
import rehypeRemark from "rehype-remark";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { Plugin } from "unified";
import type { Parent } from "unist";
import { visit } from "unist-util-visit";
import type { VFile } from "vfile";
import { prisma } from "~/utils/prisma";

function generateHashForText(text: string, occurrence: number) {
	const hash = crypto
		.createHash("sha256")
		.update(`${text}|${occurrence}`)
		.digest("hex");
	return hash;
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

		// 今回のパース結果
		const newHashes = new Set(allTextsData.map((t) => t.hash));

		// 1. 不要テキスト削除
		for (const [h, ex] of existingMap) {
			if (!newHashes.has(h)) {
				await tx.sourceText.delete({ where: { id: ex.id } });
				existingMap.delete(h);
			}
		}

		const hashToId = new Map<string, number>();
		// 2. 既存テキストUPDATE（既に存在するhashはnumberを更新）
		for (const textData of allTextsData) {
			const ex = existingMap.get(textData.hash);
			if (ex) {
				console.log("update", ex.id, textData.number, textData.text);
				await tx.sourceText.update({
					where: { id: ex.id },
					data: { number: textData.number },
				});
				hashToId.set(textData.hash, ex.id);
			}
		}

		// 3. 新規テキストINSERT（既存にないhashは新規作成）
		for (const textData of allTextsData) {
			if (!hashToId.has(textData.hash)) {
				const st = await tx.sourceText.create({
					data: {
						pageId,
						hash: textData.hash,
						text: textData.text,
						number: textData.number,
					},
					select: { id: true },
				});
				hashToId.set(textData.hash, st.id);
			}
		}

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

const blockLevelTags = new Set([
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
	visit(
		node,
		"text",
		(node: RootContent, index: number | null, parent: Parent | null) => {
			if (node.type === "text") {
				const textNode = node as Text;
				const t = textNode.value.trim();
				if (t) {
					if (result) result += " ";
					result += t;
				}
			}
		},
	);
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
				if (blockLevelTags.has(node.tagName)) {
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

			const allTextsForDb = blocks.map((b, i) => ({
				text: b.text,
				hash: b.hash,
				number: i + 1,
			}));

			const hashToId = await fullReparseUpdate(pageId, allTextsForDb);

			// 各ブロック要素を<span data-id="...">で子要素全体を包む
			for (const b of blocks) {
				const sourceTextId = hashToId.get(b.hash);
				if (!sourceTextId) continue;

				const spanNode: Element = {
					type: "element",
					tagName: "span",
					properties: {
						"data-source-text-id": sourceTextId.toString(),
					} as Properties,
					children: b.element.children,
				};

				b.element.children = [spanNode];
			}
		};
	};
}

/**
 * Markdownからテキストノードを抽出し、hash計算、DBとの同期を行い、
 * 結果としてHTMLに<span data-id="...">...</span>を挿入する。
 */
export async function processMarkdownContent(
	body: string,
	pageSlug: string,
	userId: number,
	sourceLanguage: string,
	isPublished: boolean,
) {
	const page = await upsertPageWithHtml(
		pageSlug,
		body,
		userId,
		sourceLanguage,
		isPublished,
	);

	const file = await remark()
		.use(remarkGfm)
		.use(remarkRehype)
		.use(rehypeAddDataId(page.id))
		.use(rehypeRaw)
		.use(rehypeStringify, { allowDangerousHtml: true })
		.process(body);

	const htmlContent = String(file);

	await upsertPageWithHtml(
		pageSlug,
		htmlContent,
		userId,
		sourceLanguage,
		isPublished,
	);
	return page;
}

export async function processHtmlContent(
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
	console.log(htmlContent);
	await upsertPageWithHtml(
		pageSlug,
		htmlContent,
		userId,
		sourceLanguage,
		isPublished,
	);
	return page;
}

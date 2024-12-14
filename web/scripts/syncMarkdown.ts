import crypto from "node:crypto";
import type { Parent, Root } from "mdast";
import rehypeParse from "rehype-parse";
import rehypeRaw from "rehype-raw";
import rehypeRemark from "rehype-remark";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import type { Plugin } from "unified";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import type { VFile } from "vfile";
import { prisma } from "~/utils/prisma";
/**
 * テキストと発生順(occurrence)からhashを生成する
 */
function generateHashForText(text: string, occurrence: number) {
	const hash = crypto
		.createHash("sha256")
		.update(`${text}|${occurrence}`)
		.digest("hex");
	return hash;
}
async function fullReparseUpdate(
	pageId: number,
	allTexts: {
		originalText: string;
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
		const newHashes = new Set(allTexts.map((t) => t.hash));

		// 1. 不要テキスト削除
		for (const [h, ex] of existingMap) {
			if (!newHashes.has(h)) {
				await tx.sourceText.delete({ where: { id: ex.id } });
				existingMap.delete(h);
			}
		}

		const hashToId = new Map<string, number>();

		// 2. 既存テキストUPDATE（既に存在するhashはnumberを更新）
		for (const text of allTexts) {
			const ex = existingMap.get(text.hash);
			if (ex) {
				await tx.sourceText.update({
					where: { id: ex.id },
					data: { number: text.number },
				});
				hashToId.set(text.hash, ex.id);
			}
		}

		// 3. 新規テキストINSERT（既存にないhashは新規作成）
		for (const text of allTexts) {
			if (!hashToId.has(text.hash)) {
				const st = await tx.sourceText.create({
					data: {
						pageId,
						hash: text.hash,
						text: text.originalText,
						number: text.number,
					},
					select: { id: true },
				});
				hashToId.set(text.hash, st.id);
			}
		}

		return hashToId;
	});
}
async function upsertPageWithHtml(
	pageSlug: string,
	html: string,
	userId: number,
) {
	return await prisma.page.upsert({
		where: { slug: pageSlug },
		update: { content: html },
		create: { slug: pageSlug, content: html, userId, isPublished: true },
	});
}

/**
 * remark用プラグイン
/**
 * remark用プラグイン
 * MarkdownのASTを巡回し、Textノードをdb参照・hash生成しながら
 * <span data-id="...">...</span>のHTMLノードに変換する。
 * pageIdを引数で受け取りclosureで利用するようにする。
 */
function remarkAddDataId(pageId: number): Plugin<[], Root, Root> {
	return function attacher() {
		return async (tree: Root, file: VFile) => {
			const textOccurrenceMap = new Map<string, number>();

			// 一時的にテキスト情報を蓄える
			// parent, indexも保持しておくことで後でASTを更新可能
			const collected: {
				originalText: string;
				parent: Parent;
				index: number;
				occurrence: number;
				hash: string;
			}[] = [];

			visit(tree, "text", (node, index, parent) => {
				if (!parent || typeof index !== "number") return;
				const originalText = node.value.trim();
				if (!originalText) return;

				const currentOccurrence =
					(textOccurrenceMap.get(originalText) ?? 0) + 1;
				textOccurrenceMap.set(originalText, currentOccurrence);

				const hash = generateHashForText(originalText, currentOccurrence);

				collected.push({
					originalText,
					parent,
					index,
					occurrence: currentOccurrence,
					hash,
				});
			});

			// ここでcollectedには全てのテキストノードが出現順に入っている
			// numberを1から振り直し
			const allTextsForDb = collected.map((c, i) => ({
				originalText: c.originalText,
				hash: c.hash,
				number: i + 1,
			}));

			// トランザクション内で一括処理してhash->idマップを取得
			const hashToId = await fullReparseUpdate(pageId, allTextsForDb);

			// hashToIdを用いてASTを更新
			collected.forEach((c, i) => {
				const sourceTextId = hashToId.get(c.hash);
				if (!sourceTextId) return;
				c.parent.children[c.index] = {
					type: "html",
					value: `<span data-id="${sourceTextId}">${c.originalText}</span>`,
				};
			});
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
) {
	const page = await upsertPageWithHtml(pageSlug, body, userId);

	const file = await remark()
		.use(remarkGfm)
		.use(remarkAddDataId(page.id)) // ここでtype: "html"ノードを挿入
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeRaw) // raw HTMLをHASTに取り込む
		.use(rehypeStringify, { allowDangerousHtml: true }) // HASTをHTMLへ
		.process(body);

	const htmlContent = String(file);

	await upsertPageWithHtml(pageSlug, htmlContent, userId);
	return page;
}

export async function processHtmlContent(
	htmlInput: string,
	pageSlug: string,
	userId: number,
) {
	// HTML入力に対応するpageレコードを作成・更新
	const page = await upsertPageWithHtml(pageSlug, htmlInput, userId);

	// HTML → HAST → MDAST → remarkAddDataId適用 → HTMLへの変換
	const file = await unified()
		.use(rehypeParse, { fragment: true }) // HTMLをHASTにパース
		.use(rehypeRemark) // HASTからMDASTへ変換
		.use(remarkGfm)
		.use(remarkAddDataId(page.id)) // 前と同じプラグインを適用
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeRaw)
		.use(rehypeStringify, { allowDangerousHtml: true })
		.process(htmlInput);

	const htmlContent = String(file);

	await upsertPageWithHtml(pageSlug, htmlContent, userId);
	return page;
}

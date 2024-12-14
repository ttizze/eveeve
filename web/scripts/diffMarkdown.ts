// import { create } from "jsondiffpatch";
// import parse from "remark-parse";
// import { unified } from "unified";
// import type { Node, Parent } from "unist";

// interface Block {
// 	type: string;
// 	text: string;
// 	occurrence: number; // 同一textの場合の出現順番号
// }

// // JSONDiffPatchインスタンス作成
// // objectHashで要素の一意性を確保し、detectMoveで移動を検出
// const jdp = create({
// 	objectHash: (item: any) => {
// 		// 出現順も含めてハッシュキーを一意化
// 		// 同じtype+textでもoccurrenceが異なれば異なるキーとなる
// 		return `${item.type}:${item.text}:${item.occurrence}`;
// 	},
// 	arrays: {
// 		detectMove: true,
// 	},
// });

// function extractBlocksFromMarkdown(markdown: string): Block[] {
// 	const tree = unified().use(parse).parse(markdown) as Parent;
// 	const blocks: Block[] = [];

// 	// type+textごとの出現回数をカウントするMap
// 	const occurrenceMap = new Map<string, number>();

// 	for (const node of tree.children) {
// 		if (isBlockNode(node)) {
// 			const text = extractText(node).trim();
// 			if (text !== "" || node.type === "thematicBreak") {
// 				const key = `${node.type}:${text}`;
// 				const count = (occurrenceMap.get(key) ?? 0) + 1;
// 				occurrenceMap.set(key, count);
// 				// Blockに出現回数を格納
// 				blocks.push({ type: node.type, text, occurrence: count });
// 			}
// 		}
// 	}
// 	return blocks;
// }

// function isBlockNode(node: Node): boolean {
// 	// 利用するブロックタイプを定義
// 	const blockTypes = [
// 		"paragraph",
// 		"heading",
// 		"code",
// 		"blockquote",
// 		"list",
// 		"table",
// 		"thematicBreak",
// 	];
// 	return blockTypes.includes(node.type);
// }

// function extractText(node: Node): string {
// 	let text = "";
// 	if ("value" in node && typeof node.value === "string") {
// 		text += node.value;
// 	}
// 	if ("children" in node && Array.isArray(node.children)) {
// 		for (const c of node.children) {
// 			text += extractText(c);
// 		}
// 	}
// 	return text;
// }

// // 差分を表示・処理する関数例
// function processDiff(oldBlocks: Block[], newBlocks: Block[]) {
// 	// 差分取得
// 	const diff = jdp.diff(oldBlocks, newBlocks);

// 	console.log("=== 差分(JSONDiffPatchフォーマット) ===");
// 	console.log(JSON.stringify(diff, null, 2));

// 	// diffを解析して、追加・削除・共通要素を判定する例

// 	// jsondiffpatchのパッチ形式を解析するには、逆方向適用などを行うか、
// 	// diff自体をパースする必要がある。
// 	// ここでは簡易的に、「追加」されたブロックや「削除」されたブロックを抽出する流れを示す。

// 	// 差分オブジェクトの形式: 配列比較時は "_t": "a" が付与され、
// 	// 移動/挿入/削除が特定キーで表現される。
// 	// 参考: https://github.com/benjamine/jsondiffpatch/blob/master/docs/deltas.md

// 	// 簡易的にdiffを読み解くには、jsondiffpatchでパッチを適用しながらチェックする等の方法もある。

// 	// 実装例: パッチ適用でoldBlocks→newBlocksを再現し、適用前後で何が起きたか把握する
// 	const oldCopy = JSON.parse(JSON.stringify(oldBlocks));
// 	jdp.patch(oldCopy, diff);

// 	// oldCopyはnewBlocksと同一になった
// 	// この過程で適用された操作をフックすれば、追加・削除を検出可能。
// 	// しかしjsondiffpatchは直接フック用APIは用意していないため、diffオブジェクトを直接解析する必要がある。

// 	// 簡易解析：配列deltaは { "_t": "a", [index]: [valueDiff], ... } の形式
// 	// 挿入: indexが末尾に "_"+数字の形で新要素が追加される
// 	// 削除: 元の要素が [oldValue, 0, 0] のような形で示される

// 	// 以下はdiffオブジェクトがあると仮定して、簡易パース例
// 	if (diff && typeof diff === "object") {
// 		// diff全体は配列変更なのでプロパティを走査
// 		for (const key of Object.keys(diff)) {
// 			if (key === "_t") continue; // タイプ指定キーは無視

// 			const change = diff[key];
// 			// 追加された要素は [newValue] 形式で "_t":"a" と共に記録される
// 			// 削除された要素は [oldValue, 0, 0] という形式

// 			// "移動"は [oldValue, oldPos, newPos] のような形式で表示
// 			// JSONdiffpatchのドキュメントを参照し、適宜処理を追加

// 			if (Array.isArray(change)) {
// 				// 配列の変更があった場合、changeは [newValue], [oldValue,0,0], [oldValue,oldPos,newPos] 等
// 				if (change.length === 1) {
// 					// [newValue] の場合 → 追加
// 					const newValue = change[0];
// 					console.log("追加ブロック:", newValue);
// 				} else if (change.length === 3 && change[1] === 0 && change[2] === 0) {
// 					// [oldValue,0,0] → 削除
// 					const oldValue = change[0];
// 					console.log("削除ブロック:", oldValue);
// 				} else if (
// 					change.length === 3 &&
// 					typeof change[1] === "number" &&
// 					typeof change[2] === "number"
// 				) {
// 					// [oldValue, oldPos, newPos] → 移動
// 					const oldValue = change[0];
// 					console.log(
// 						"移動ブロック:",
// 						oldValue,
// 						"移動:",
// 						change[1],
// 						"→",
// 						change[2],
// 					);
// 				}
// 			}
// 		}
// 	}
// }

// // ==== デモ ====

// // 古いMarkdownと新しいMarkdown
// const oldMarkdown = `
// # 見出し1

// あ

// い

// う

// - リスト1
// - リスト2

// \`\`\`
// コードブロック
// \`\`\`

// う

// え
// `;

// const newMarkdown = `
// # 見出し1

// あ

// い

// う

// お

// う

// - リスト1
// - リスト2

// \`\`\`
// コードブロック
// \`\`\`

// え
// `;

// // ブロック抽出
// const oldBlocks = extractBlocksFromMarkdown(oldMarkdown);
// const newBlocks = extractBlocksFromMarkdown(newMarkdown);

// // diff処理
// processDiff(oldBlocks, newBlocks);

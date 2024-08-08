import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export const extractArticle = (
	html: string,
	sourceURL: string | null,
): { content: string; title: string } => {
	const dom = new JSDOM(html, { url: sourceURL || undefined });
	const document = dom.window.document;
	const reader = new Readability(document);
	const article = reader.parse();

	if (!article) {
		throw new Error("記事の抽出に失敗しました");
	}

	const contentDom = new JSDOM(article.content);
	const contentDocument = contentDom.window.document;

	if (sourceURL) {
		for (const img of contentDocument.querySelectorAll("img")) {
			const src = img.getAttribute("src");
			if (src) {
				try {
					// 相対パスを絶対URLに解決
					const resolvedSrc = new URL(src, sourceURL).href;
					img.setAttribute("src", resolvedSrc);
				} catch (error) {
					console.error(`Failed to resolve image path: ${src}`, error);
				}
			}
		}
	}

	const resolvedContent = contentDom.serialize();

	console.log("article", {
		...article,
		content: resolvedContent,
	});

	return { content: resolvedContent, title: article.title };
};

import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export const extractArticle = (
	html: string,
	baseUrl: string,
): { content: string; title: string } => {
	const dom = new JSDOM(html, { url: baseUrl });
	const document = dom.window.document;
	const reader = new Readability(document);
	const article = reader.parse();

	if (!article) {
		throw new Error("記事の抽出に失敗しました");
	}

	// 抽出されたコンテンツ内の画像パスを解決
	const contentDom = new JSDOM(article.content);
	const contentDocument = contentDom.window.document;

	for (const img of contentDocument.querySelectorAll("img")) {
		const src = img.getAttribute("src");
		if (src) {
			try {
				// 相対パスを絶対URLに解決
				const absoluteUrl = new URL(src, baseUrl).href;
				img.setAttribute("src", absoluteUrl);
			} catch (error) {
				console.error(`Failed to resolve image path: ${src}`, error);
			}
		}
	}

	const resolvedContent = contentDom.serialize();

	return { content: resolvedContent, title: article.title };
};

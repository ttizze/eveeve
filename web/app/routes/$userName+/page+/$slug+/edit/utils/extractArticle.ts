import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export const extractArticle = (
	html: string,
): { content: string; title: string } => {
	const dom = new JSDOM(html);
	const document = dom.window.document;
	const reader = new Readability(document);
	const article = reader.parse();

	if (!article) {
		throw new Error("記事の抽出に失敗しました");
	}

	const contentDom = new JSDOM(article.content);
	const resolvedContent = contentDom.serialize();

	console.log("article", {
		...article,
		content: resolvedContent,
	});

	return { content: resolvedContent, title: article.title };
};

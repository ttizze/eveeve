import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export const extractArticle = (html: string): { content: string; title: string } => {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const reader = new Readability(document);
  const article = reader.parse();

  if (!article) {
    throw new Error("記事の抽出に失敗しました");
  }

  return { content: article.content, title: article.title };
};


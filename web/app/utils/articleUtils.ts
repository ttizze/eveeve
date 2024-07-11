import { Readability } from "@mozilla/readability";
export const extractArticle = (html: string): { content: string; title: string } => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const reader = new Readability(doc);
  const article = reader.parse();

  if (!article) {
    throw new Error("記事の抽出に失敗しました");
  }

  return { content: article.content, title: article.title };
};


function createTranslationElement(translationText: string): HTMLElement {
  const translationElement = document.createElement("translation");
  translationElement.setAttribute("lang", "ja");
  translationElement.className = "notranslate";
  translationElement.style.cssText = "display: block; line-height: 1.5; background-color: #f0f0f0; border-radius: 4px;";
  const formattedText = translationText.replace(/\n/g, '<br>');
  translationElement.innerHTML = formattedText;
  return translationElement;
}

export async function displayContent(
  numberedContent: string,
  allTranslations: { number: number; text: string }[]
): Promise<string> {
  
  const doc = new DOMParser().parseFromString(numberedContent, "text/html");

  for (const translation of allTranslations) {
    const element = doc.querySelector(`[data-number="${translation.number}"]`);
    if (element) {
      const translationElement = createTranslationElement(translation.text);
      element.appendChild(translationElement);
    }
  }

  return Array.from(doc.body.childNodes)
    .map((node) =>
      node.nodeType === Node.ELEMENT_NODE
        ? (node as Element).outerHTML
        : node.textContent,
    )
    .join("");
}

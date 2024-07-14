import { JSDOM } from "jsdom";
const { Node } = new JSDOM().window;

function createTranslationElement(translationText: string): HTMLElement {
	const dom = new JSDOM();
	const translationElement = dom.window.document.createElement("translation");
	translationElement.setAttribute("lang", "ja");
	translationElement.className = "notranslate";
	translationElement.style.cssText =
		"display: block; line-height: 1.5; background-color: #f0f0f0; border-radius: 4px;";
	const formattedText = translationText.replace(/\n/g, "<br>");
	translationElement.innerHTML = formattedText;
	return translationElement;
}

export async function displayContent(
	numberedContent: string,
	allTranslations: { number: number; text: string }[],
): Promise<string> {
	const doc = new JSDOM(numberedContent);

	for (const translation of allTranslations) {
		const element = doc.window.document.querySelector(
			`[data-number="${translation.number}"]`,
		);
		if (element) {
			const translationElement = createTranslationElement(translation.text);
			element.appendChild(translationElement);
		}
	}

	return Array.from(doc.window.document.body.childNodes)
		.map((node) =>
			node.nodeType === Node.ELEMENT_NODE
				? (node as Element).outerHTML
				: node.textContent,
		)
		.join("");
}

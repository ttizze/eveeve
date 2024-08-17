import DOMPurify from "isomorphic-dompurify";
import { JSDOM } from "jsdom";
const { Node } = new JSDOM().window;

interface NumberedSourceText {
	number: number;
	sourceTextId: number;
}

export function addSourceTextIdToContent(
	content: string,
	numberedSourceTexts: NumberedSourceText[],
): string {
	const sanitizedContent = DOMPurify.sanitize(content);
	const doc = new JSDOM(sanitizedContent);

	function processNode(node: Node) {
		if (node.nodeType === Node.ELEMENT_NODE) {
			const element = node as Element;
			const dataNumber = element.getAttribute("data-number");
			if (dataNumber) {
				const number = Number.parseInt(dataNumber, 10);
				const sourceText = numberedSourceTexts.find(
					(st) => st.number === number,
				);
				if (sourceText) {
					element.setAttribute(
						"data-source-text-id",
						sourceText.sourceTextId.toString(),
					);
				}
			}

			element.childNodes.forEach(processNode);
		}
	}

	Array.from(doc.window.document.body.childNodes).forEach(processNode);

	return Array.from(doc.window.document.body.childNodes)
		.map((node) =>
			node.nodeType === Node.ELEMENT_NODE
				? (node as Element).outerHTML
				: node.textContent,
		)
		.join("");
}

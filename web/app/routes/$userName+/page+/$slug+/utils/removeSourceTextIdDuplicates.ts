import DOMPurify from "isomorphic-dompurify";
import { JSDOM } from "jsdom";
const { Node } = new JSDOM().window;

export function removeSourceTextIdDuplicates(content: string): string {
	const sanitizedContent = DOMPurify.sanitize(content);
	const doc = new JSDOM(sanitizedContent);
	const usedSourceTextIds = new Set<string>();

	function processNode(node: Node) {
		if (node.nodeType === Node.ELEMENT_NODE) {
			const element = node as Element;
			const sourceTextId = element.getAttribute("data-source-text-id");

			if (sourceTextId) {
				if (usedSourceTextIds.has(sourceTextId)) {
					element.removeAttribute("data-source-text-id");
				} else {
					usedSourceTextIds.add(sourceTextId);
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

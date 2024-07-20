import { JSDOM } from "jsdom";

export function extractNumberedElements(
	content: string,
	title: string,
): Array<{ number: number; text: string }> {
	const doc = new JSDOM(content);
	const numberedElements: Array<{ number: number; text: string }> = [
		{ number: 0, text: title },
	];

	function traverseNodes(node: Node) {
		if (node.nodeType === 1) {
			const element = node as Element;
			const dataNumber = element.getAttribute("data-number");

			if (dataNumber !== null) {
				numberedElements.push({
					number: Number.parseInt(dataNumber, 10),
					text: element.textContent?.trim() || "",
				});
			}

			element.childNodes.forEach(traverseNodes);
		}
	}

	doc.window.document.body.childNodes.forEach(traverseNodes);

	return numberedElements.sort((a, b) => a.number - b.number);
}

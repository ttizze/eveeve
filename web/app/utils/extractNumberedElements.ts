export function extractNumberedElements(
	content: string,
): Array<{ number: number; text: string }> {
	const parser = new DOMParser();
	const doc = parser.parseFromString(content, "text/html");
	const numberedElements: Array<{ number: number; text: string }> = [];

	function traverseNodes(node: Node) {
		if (node.nodeType === Node.ELEMENT_NODE) {
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

	doc.body.childNodes.forEach(traverseNodes);

	return numberedElements.sort((a, b) => a.number - b.number);
}

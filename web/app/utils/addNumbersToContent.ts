import DOMPurify from "dompurify";

export function shouldProcessElement(element: Element): boolean {
	const htmlElement = element as HTMLElement;

	const isTranslatable = htmlElement.getAttribute("translate") !== "no";
	const isNotExcludedClass = !htmlElement.classList.contains("notranslate");
	const isNotEditable = !htmlElement.isContentEditable;
	const isNotAlreadyTranslated =
		htmlElement.getAttribute("data-translated") !== "true";
	const isNotTooltip = !htmlElement.classList.contains(
		"eveeve-source-text-tooltip",
	);
	const isNotExcludedTag = ![
		"script",
		"style",
		"textarea",
		"input",
		"pre",
		"noscript",
		"iframe",
		"source",
	].includes(element.nodeName.toLowerCase());
	const isVisible = htmlElement.style.display !== "none";
	const isVisiblyHidden = htmlElement.style.visibility !== "hidden";

	return (
		isTranslatable &&
		isNotExcludedClass &&
		isNotEditable &&
		isNotAlreadyTranslated &&
		isNotTooltip &&
		isNotExcludedTag &&
		isVisible &&
		isVisiblyHidden
	);
}

export function addNumbersToContent(content: string): string {
	const sanitizedContent = DOMPurify.sanitize(content);
	const doc = new DOMParser().parseFromString(sanitizedContent, "text/html");
	let currentNumber = 1;

	function processNode(node: Node) {
		if (
			node.nodeType === Node.ELEMENT_NODE &&
			shouldProcessElement(node as Element)
		) {
			const element = node as Element;
			const hasDirectTextContent = Array.from(element.childNodes).some(
				(childNode) =>
					childNode.nodeType === Node.TEXT_NODE &&
					childNode.textContent?.trim() !== "",
			);

			if (hasDirectTextContent) {
				element.setAttribute("data-number", currentNumber.toString());
				currentNumber++;
				return;
			}

			element.childNodes.forEach(processNode);
		}
	}

	Array.from(doc.body.childNodes).forEach(processNode);

	return Array.from(doc.body.childNodes)
		.map((node) =>
			node.nodeType === Node.ELEMENT_NODE
				? (node as Element).outerHTML
				: node.textContent,
		)
		.join("");
}

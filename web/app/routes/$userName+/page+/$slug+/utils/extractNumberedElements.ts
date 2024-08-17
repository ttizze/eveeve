import { JSDOM } from "jsdom";
import type { NumberedElement } from "../edit/types";

export function extractNumberedElements(
	content: string,
	title: string,
	titleSourceTextId: number | null,
): Array<NumberedElement> {
	const doc = new JSDOM(content);
	const numberedElements: Array<NumberedElement> = [
		{ number: 0, text: title, sourceTextId: titleSourceTextId },
	];
	// <br>のみを改行とする
	doc.window.document.body.innerHTML = doc.window.document.body.innerHTML
		.replace(/\n/g, "")
		.replace(/<br\s*\/?>/gi, "\n");

	const elements = doc.window.document.querySelectorAll("[data-number]");

	for (const element of elements) {
		const dataNumber = element.getAttribute("data-number");
		const dataSourceTextId = element.getAttribute("data-source-text-id");
		if (dataNumber !== null) {
			numberedElements.push({
				number: Number.parseInt(dataNumber, 10),
				text: element.textContent?.trim() || "",
				sourceTextId: dataSourceTextId
					? Number.parseInt(dataSourceTextId, 10)
					: null,
			});
		}
	}

	return numberedElements.sort((a, b) => a.number - b.number);
}

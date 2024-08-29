
import { JSDOM } from "jsdom";
import type { TextElementInfo } from "../types";

export async function extractTextElementInfo(
	content: string,
	title: string,
	titleSourceTextId: number | null,
): Promise<Array<TextElementInfo>> {
	const doc = new JSDOM(content);

	const textElements: Array<TextElementInfo> = [
		{
			number: 0,
			text: title,
			sourceTextId: titleSourceTextId,
		},
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
			textElements.push({
				number: Number.parseInt(dataNumber, 10),
				text: element.textContent?.trim() || "",
				sourceTextId: dataSourceTextId
					? Number.parseInt(dataSourceTextId, 10)
					: null,
			});
		}
	}
	return textElements.sort((a, b) => a.number - b.number);
}

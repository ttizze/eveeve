import { JSDOM } from "jsdom";

export function extractNumberedElements(
	content: string,
	title: string,
): Array<{ number: number; text: string }> {
	const doc = new JSDOM(content);
	const numberedElements: Array<{ number: number; text: string }> = [
		{ number: 0, text: title },
	];
	// <br>のみを改行とする
	doc.window.document.body.innerHTML = doc.window.document.body.innerHTML
		.replace(/\n/g, "")
		.replace(/<br\s*\/?>/gi, "\n");

	const elements = doc.window.document.querySelectorAll("[data-number]");

	for (const element of elements) {
		const dataNumber = element.getAttribute("data-number");
		if (dataNumber !== null) {
			numberedElements.push({
				number: Number.parseInt(dataNumber, 10),
				text: element.textContent?.trim() || "",
			});
		}
	}

	return numberedElements.sort((a, b) => a.number - b.number);
}

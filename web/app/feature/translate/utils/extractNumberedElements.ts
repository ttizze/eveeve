import { Parser } from "htmlparser2";

export function extractNumberedElements(
	content: string,
	title: string,
): Array<{ number: number; text: string }> {
	const numberedElements: Array<{ number: number; text: string }> = [
		{ number: 0, text: title },
	];

	let currentNumber: number | null = null;
	let currentText: string[] = [];
	let inNumberedElement = false;

	const parser = new Parser(
		{
			onopentag(name: string, attributes: { [x: string]: string }) {
				if (attributes["data-number"]) {
					currentNumber = Number.parseInt(attributes["data-number"], 10);
					inNumberedElement = true;
					currentText = [];
				}
			},
			ontext(text) {
				if (inNumberedElement) {
					currentText.push(text.trim());
				}
			},
			onclosetag(name) {
				if (name === "br" && inNumberedElement) {
					currentText.push("::BR::");
				} else if (currentNumber !== null && inNumberedElement) {
					const processedText = currentText
						.join("")
						.replace(/\s+/g, " ")
						.trim()
						.replace(/::BR::/g, "\n");

					if (processedText) {
						numberedElements.push({
							number: currentNumber,
							text: processedText,
						});
					}
					currentNumber = null;
					inNumberedElement = false;
				}
			},
		},
		{ decodeEntities: true },
	);

	parser.write(content);
	parser.end();

	return numberedElements.sort((a, b) => a.number - b.number);
}

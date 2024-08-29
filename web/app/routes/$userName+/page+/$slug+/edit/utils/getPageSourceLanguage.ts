import { franc } from "franc";
import type { TextElementInfo } from "../types";
import { iso6393To1 } from "./iso6393-to-1";

export async function getPageSourceLanguage(textElements: Array<TextElementInfo>): Promise<string> {
    const sortedContent = textElements
		.sort((a, b) => a.number - b.number)
		.map(element => element.text)
		.join('\n');

	const language = await franc(sortedContent);

	return iso6393To1[language];
}
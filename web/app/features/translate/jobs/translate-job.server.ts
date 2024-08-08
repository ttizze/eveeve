import { addNumbersToContent } from "../../prepare-html-for-translate/utils/addNumbersToContent";
import { extractNumberedElements } from "../../prepare-html-for-translate/utils/extractNumberedElements";
import { translate } from "../lib/translate.server";
import type { TranslateJobParams } from "../types";

export const translateJob = async (params: TranslateJobParams) => {
	const numberedContent = addNumbersToContent(params.content);
	const extractedNumberedElements = extractNumberedElements(numberedContent);

	await translate(
		params.apiKey,
		params.aiModel,
		params.userId,
		params.targetLanguage,
		params.title,
		numberedContent,
		extractedNumberedElements,
		params.sourceUrl || "",
		params.slug,
	);
};

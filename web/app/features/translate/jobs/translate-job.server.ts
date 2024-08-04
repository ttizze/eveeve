import { addNumbersToContent } from "../../prepare-html-for-translate/utils/addNumbersToContent";
import { extractArticle } from "../../prepare-html-for-translate/utils/extractArticle";
import { extractNumberedElements } from "../../prepare-html-for-translate/utils/extractNumberedElements";
import { fetchWithRetry } from "../../prepare-html-for-translate/utils/fetchWithRetry";
import { translate } from "../lib/translation";

interface TranslateJobParams {
	url: string;
	targetLanguage: string;
	apiKey: string;
	userId: number;
	aiModel: string;
}
export const translateJob = async (params: TranslateJobParams) => {
	const html = await fetchWithRetry(params.url);
	const { content, title } = extractArticle(html, params.url);
	const numberedContent = addNumbersToContent(content);
	const extractedNumberedElements = extractNumberedElements(numberedContent);
	const targetLanguage = params.targetLanguage;

	await translate(
		params.apiKey,
		params.aiModel,
		params.userId,
		targetLanguage,
		title,
		numberedContent,
		extractedNumberedElements,
		params.url,
	);
};

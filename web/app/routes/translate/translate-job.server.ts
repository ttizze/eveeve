import { fetchWithRetry } from "../../feature/translate/utils/fetchWithRetry";
import { extractArticle } from "../../feature/translate/utils/extractArticle";
import { addNumbersToContent } from "../../feature/translate/utils/addNumbersToContent";
import { extractNumberedElements } from "../../feature/translate/utils/extractNumberedElements";
import { translate } from "../../feature/translate/libs/translation";

interface TranslateJobParams {
	url: string;
	targetLanguage: string;
	apiKey: string;
	userId: number;
}
export const translateJob = async (params: TranslateJobParams) => {
	const html = await fetchWithRetry(params.url);
	const { content, title } = extractArticle(html, params.url);
	const numberedContent = addNumbersToContent(content);
	const extractedNumberedElements = extractNumberedElements(
		numberedContent,
		title,
	);
	const targetLanguage = params.targetLanguage;

	await translate(
		params.apiKey,
		params.userId,
		targetLanguage,
		title,
		numberedContent,
		extractedNumberedElements,
		params.url,
	);
};

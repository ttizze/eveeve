import { translate } from "../libs/translation";
import { addNumbersToContent } from "../utils/addNumbersToContent";
import { extractArticle } from "../utils/extractArticle";
import { extractNumberedElements } from "../utils/extractNumberedElements";
import { fetchWithRetry } from "../utils/fetchWithRetry";

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
	const extractedNumberedElements = extractNumberedElements(
		numberedContent,
		title,
	);
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

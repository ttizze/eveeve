import { fetchWithRetry } from '../utils/fetchWithRetry';
import { extractArticle } from '../utils/extractArticle';
import { addNumbersToContent } from '../utils/addNumbersToContent';
import { extractNumberedElements } from '../utils/extractNumberedElements';
import { translate } from '../libs/translation';

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
    title
  );
  const targetLanguage = params.targetLanguage;

  await translate(
    params.apiKey,
    params.userId,
    targetLanguage,
    title,
    numberedContent,
    extractedNumberedElements,
    params.url
  );
};

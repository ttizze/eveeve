import { getOrCreatePageVersionTranslationInfo } from "../../../libs/pageVersionTranslationInfo";
import { getOrCreateSourceTextId } from "../../../libs/sourceTextService";
import { getOrCreateAIUser } from "../../../libs/userService";
import { prisma } from "../../../utils/prisma";
import { AI_MODEL, MAX_CHUNK_SIZE } from "../constants";
import type { NumberedElement } from "../types";
import { getGeminiModelResponse } from "../utils/gemini";

export function splitNumberedElements(
	elements: NumberedElement[],
): NumberedElement[][] {
	const chunks: NumberedElement[][] = [];
	let currentChunk: NumberedElement[] = [];
	let currentSize = 0;

	for (const element of elements) {
		if (
			currentSize + element.text.length > MAX_CHUNK_SIZE &&
			currentChunk.length > 0
		) {
			chunks.push(currentChunk);
			currentChunk = [];
			currentSize = 0;
		}
		currentChunk.push(element);
		currentSize += element.text.length;
	}

	if (currentChunk.length > 0) {
		chunks.push(currentChunk);
	}
	return chunks;
}

export function extractTranslations(jsonString: string): NumberedElement[] {
	try {
		const parsedData = JSON.parse(jsonString);

		if (Array.isArray(parsedData)) {
			return parsedData.map((item) => ({
				number: Number(item.number),
				text: String(item.text),
			}));
		}
		console.error("Parsed data is not an array");
		return [];
	} catch (error) {
		console.error("Failed to parse JSON:", error);
		return [];
	}
}

export async function getOrCreateTranslations(
	geminiApiKey: string,
	elements: NumberedElement[],
	targetLanguage: string,
	pageId: number,
	pageVersionId: number,
	title: string,
): Promise<NumberedElement[]> {
	const translations: NumberedElement[] = [];
	const untranslatedElements: NumberedElement[] = [];
	const sourceTextsId = await Promise.all(
		elements.map((element) =>
			getOrCreateSourceTextId(
				element.text,
				element.number,
				pageId,
				pageVersionId,
			),
		),
	);

	const existingTranslations = await prisma.translateText.findMany({
		where: {
			sourceTextId: { in: sourceTextsId },
			targetLanguage,
		},
		orderBy: [{ point: "desc" }, { createdAt: "desc" }],
	});

	const translationMap = new Map(
		existingTranslations.map((t) => [t.sourceTextId, t]),
	);

	elements.forEach((element, index) => {
		const sourceTextId = sourceTextsId[index];
		const existingTranslation = translationMap.get(sourceTextId);

		if (existingTranslation) {
			translations.push({
				number: element.number,
				text: existingTranslation.text,
			});
		} else {
			untranslatedElements.push(element);
		}
	});

	if (untranslatedElements.length > 0) {
		const newTranslations = await translateUntranslatedElements(
			geminiApiKey,
			untranslatedElements,
			targetLanguage,
			pageId,
			pageVersionId,
			title,
		);
		translations.push(...newTranslations);
	}

	return translations.sort((a, b) => a.number - b.number);
}

async function translateUntranslatedElements(
	geminiApiKey: string,
	untranslatedElements: NumberedElement[],
	targetLanguage: string,
	pageId: number,
	pageVersionId: number,
	title: string,
): Promise<NumberedElement[]> {
	const source_text = untranslatedElements
		.map((el) => JSON.stringify(el))
		.join("\n");
	const translatedText = await getGeminiModelResponse(
		geminiApiKey,
		AI_MODEL,
		title,
		source_text,
		targetLanguage,
	);

	const extractedTranslations = extractTranslations(translatedText);
	await getOrCreatePageVersionTranslationInfo(
		pageVersionId,
		targetLanguage,
		extractedTranslations[0].text,
	);

	const systemUserId = await getOrCreateAIUser(AI_MODEL);

	await Promise.all(
		extractedTranslations.map(async (translation) => {
			const sourceText = untranslatedElements.find(
				(el) => el.number === translation.number,
			)?.text;

			if (!sourceText) {
				console.error(
					`Source text not found for translation number ${translation.number}`,
				);
				return;
			}

			const sourceTextId = await getOrCreateSourceTextId(
				sourceText,
				translation.number,
				pageId,
				pageVersionId,
			);
			await prisma.translateText.create({
				data: {
					targetLanguage,
					text: translation.text,
					sourceTextId,
					pageId,
					userId: systemUserId,
				},
			});
		}),
	);

	return extractedTranslations;
}

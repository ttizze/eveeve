import { getOrCreatePageVersionTranslationInfo } from "../../../libs/pageVersionTranslationInfo";
import { getOrCreateSourceTextId } from "../../../libs/sourceTextService";
import { getOrCreateAIUser } from "../../../libs/userService";
import { getGeminiModelResponse } from "../../../utils/gemini";
import { getVertexAIModelResponse } from "../../../utils/vertexai";
import { prisma } from "../../../utils/prisma";
import { AI_MODEL, MAX_CHUNK_SIZE } from "../constants";
import type { NumberedElement } from "../types";

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

export function extractTranslations(
	text: string,
): { number: number; text: string }[] {
	try {
		// まず、文字列をJSONとしてパースしてみる
		const parsed = JSON.parse(text);
		if (Array.isArray(parsed)) {
			return parsed;
		}
	} catch (error) {
		console.warn("Failed to parse JSON, falling back to regex parsing", error);
	}

	const translations: { number: number; text: string }[] = [];
	const regex =
		/{\s*"number"\s*:\s*(\d+)\s*,\s*"text"\s*:\s*"((?:\\.|[^"\\])*)"\s*}/g;
	let match: RegExpExecArray | null;

	while (true) {
		match = regex.exec(text);
		if (match === null) break;

		translations.push({
			number: Number.parseInt(match[1], 10),
			text: match[2],
		});
	}

	return translations;
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
	console.log("untranslatedText", source_text);
	const translatedText = await getGeminiModelResponse(
		geminiApiKey,
		AI_MODEL,
		title,
		source_text,
		targetLanguage,
	);

	const extractedTranslations = extractTranslations(translatedText);
	console.log("extractedNowTranslations", extractedTranslations);
	await getOrCreatePageVersionTranslationInfo(
		pageVersionId,
		targetLanguage,
		extractedTranslations[1].text,
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

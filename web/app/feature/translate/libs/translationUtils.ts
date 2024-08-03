import { getOrCreateAIUser } from "~/libs/db/user.server";
import { getOrCreatePageVersionTranslationInfo } from "../../../libs/pageVersionTranslationInfo";
import { MAX_CHUNK_SIZE } from "../../../routes/translate/constants";
import type { NumberedElement } from "../../../routes/translate/types";
import { prisma } from "../../../utils/prisma";
import { getOrCreateSourceTextIdAndPageVersionSourceText } from "../functions/mutations.server";
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

export function extractTranslations(
	text: string,
): { number: number; text: string }[] {
	try {
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
	aiModel: string,
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
			getOrCreateSourceTextIdAndPageVersionSourceText(
				element.text,
				element.number,
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
			aiModel,
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
	aiModel: string,
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
		aiModel,
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

	const systemUserId = await getOrCreateAIUser(aiModel);

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

			const sourceTextId =
				await getOrCreateSourceTextIdAndPageVersionSourceText(
					sourceText,
					translation.number,
					pageVersionId,
				);
			await prisma.translateText.create({
				data: {
					targetLanguage,
					text: translation.text,
					sourceTextId,
					userId: systemUserId,
				},
			});
		}),
	);

	return extractedTranslations;
}

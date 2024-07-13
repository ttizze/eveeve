import { getGeminiModelResponse } from "./gemini";
import { prisma } from "../../../utils/prisma";
import { getOrCreatePageId } from "../../../utils/pageService";
import { getOrCreatePageVersionId } from "../../../utils/pageVersionService";
import { getOrCreateSourceTextId } from "../../../utils/sourceTextService";
import type { NumberedElement } from "../types";
import { getOrCreateTranslationStatus } from "../../../utils/translationStatus";

const MAX_CHUNK_SIZE = 20000;

function splitNumberedElements(
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

export async function translate(
	title: string,
	numberedContent: string,
	numberedElements: NumberedElement[],
	url: string,
): Promise<string> {
	const allTranslations: NumberedElement[] = [];
	const targetLanguage = "ja";
	const pageId = await getOrCreatePageId(url || "");
	const pageVersionId = await getOrCreatePageVersionId(
		url,
		title,
		numberedContent,
		pageId,
	);

	const translationStatus = await getOrCreateTranslationStatus(
		pageVersionId,
		targetLanguage,
	);

	if (translationStatus.status === "completed") {
		return translationStatus.status;
	}

	const chunks = splitNumberedElements(numberedElements);
	for (const chunk of chunks) {
		const translations = await getOrCreateTranslations(
			chunk,
			targetLanguage,
			pageId,
			pageVersionId,
			title,
		);
		allTranslations.push(...translations);
	}
	console.log("allTranslations", allTranslations);

	return translationStatus.status;
}

export function extractTranslations(
	text: string,
): { number: number; text: string }[] {
	const translations: { number: number; text: string }[] = [];
	const regex =
		/{\s*"number"\s*:\s*(\d+)\s*,\s*"text"\s*:\s*"((?:\\.|[^"\\])*)"\s*}/g;
	let match: RegExpExecArray | null;

	while (true) {
		match = regex.exec(text);
		if (match === null) break;

		translations.push({
			number: Number.parseInt(match[1], 10),
			text: match[2].replace(/\\"/g, '"').replace(/\\n/g, "\n"),
		});
	}
	return translations;
}

async function getOrCreateTranslations(
	elements: { number: number; text: string }[],
	targetLanguage: string,
	pageId: number,
	webPageVersionId: number,
	title: string,
): Promise<{ number: number; text: string }[]> {
	const translations: { number: number; text: string }[] = [];
	const untranslatedElements: { number: number; text: string }[] = [];
	const sourceTextsId = await Promise.all(
		elements.map((element) =>
			getOrCreateSourceTextId(element.text, pageId, webPageVersionId),
		),
	);

	const existingTranslations = await prisma.translateText.findMany({
		where: {
			sourceTextId: { in: sourceTextsId },
			language: targetLanguage,
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
			untranslatedElements,
			targetLanguage,
			pageId,
			webPageVersionId,
			title,
		);
		translations.push(...newTranslations);
	}

	return translations.sort((a, b) => a.number - b.number);
}

async function translateUntranslatedElements(
	untranslatedElements: { number: number; text: string }[],
	targetLanguage: string,
	pageId: number,
	webPageVersionId: number,
	title: string,
): Promise<{ number: number; text: string }[]> {
	const source_text = untranslatedElements
		.map((el) => JSON.stringify(el))
		.join("\n");

	const translatedText = await getGeminiModelResponse(
		title,
		source_text,
		targetLanguage,
	);

	const extractedTranslations = extractTranslations(translatedText);

	const systemUserId = 1; // TODO: システムユーザーIDの取得方法を改善する

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
				pageId,
				webPageVersionId,
			);

			await prisma.translateText.create({
				data: {
					language: targetLanguage,
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

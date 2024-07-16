import { getOrCreatePageId } from "../../../utils/pageService";
import { getOrCreatePageVersionId } from "../../../utils/pageVersionService";
import { prisma } from "../../../utils/prisma";
import { getOrCreateSourceTextId } from "../../../utils/sourceTextService";
import { getOrCreateAIUser } from "../../../utils/userService";
import { updateUserReadHistory } from "./../../../utils/userReadHistory";
import { getGeminiModelResponse } from "./gemini";
import { updatePageVersionTranslationInfoTranslationStatusAndTranslationProgress, getOrCreatePageVersionTranslationInfo } from "./../../../utils/pageVersionTranslationInfo";
import Queue, { type Queue as QueueType } from "bull";
import { updatePageVersionTranslationInfoTitle } from "../../../utils/pageVersionTranslationInfo";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const createUserTranslationQueue = (userId: number) =>
	new Queue(`translation-user-${userId}`, REDIS_URL);
const userTranslationQueues: { [userId: number]: QueueType } = {};

const MAX_CHUNK_SIZE = 30000;
export type NumberedElement = {
	number: number;
	text: string;
};

export async function translate(
	geminiApiKey: string,
	userId: number,
	targetLanguage: string,
	title: string,
	numberedContent: string,
	numberedElements: NumberedElement[],
	url: string,
): Promise<string> {
	const pageId = await getOrCreatePageId(url || "");
	const pageVersionId = await getOrCreatePageVersionId(
		url,
		title,
		numberedContent,
		pageId,
	);

	const pageVersionTranslationInfo = await getOrCreatePageVersionTranslationInfo(
		pageVersionId,
		targetLanguage
	);
	await updateUserReadHistory(userId, pageVersionId, 0);

	if (pageVersionTranslationInfo.translationStatus === "completed") {
		return pageVersionTranslationInfo.translationStatus;
	}

	const userTranslationQueue = setupUserQueue(userId, geminiApiKey);
	await userTranslationQueue.add({
		pageId,
		pageVersionId,
		targetLanguage,
		title,
		numberedElements,
	});

	return pageVersionTranslationInfo.translationStatus;
}

export function setupUserQueue(userId: number, geminiApiKey: string) {
	if (userTranslationQueues[userId]) {
		return userTranslationQueues[userId];
	}
	const userTranslationQueue = createUserTranslationQueue(userId);
	userTranslationQueue.process(async (job) => {
		const { pageId, pageVersionId, targetLanguage, title, numberedElements } =
			job.data;
		try {
			const chunks = splitNumberedElements(numberedElements);
      const totalChunks = chunks.length;
      for (let i = 0; i < chunks.length; i++) {
        await getOrCreateTranslations(
          geminiApiKey,
          chunks[i],
          targetLanguage,
          pageId,
          pageVersionId,
          title,
        );
        const progress = ((i + 1) / totalChunks) * 100;
        await updatePageVersionTranslationInfoTranslationStatusAndTranslationProgress(pageVersionId, targetLanguage,  "in_progress", progress);
      }
			await updatePageVersionTranslationInfoTranslationStatusAndTranslationProgress(pageVersionId, targetLanguage,  "completed", 100);
		} catch (error) {
			console.error("Background translation job failed:", error);
			await updatePageVersionTranslationInfoTranslationStatusAndTranslationProgress(pageVersionId, targetLanguage, "failed", 0);
		}
	});
	userTranslationQueues[userId] = userTranslationQueue;
	return userTranslationQueue;
}

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
	geminiApiKey: string,
	elements: { number: number; text: string }[],
	targetLanguage: string,
	pageId: number,
	pageVersionId: number,
	title: string,
): Promise<{ number: number; text: string }[]> {
	const translations: { number: number; text: string }[] = [];
	const untranslatedElements: { number: number; text: string }[] = [];
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
	untranslatedElements: { number: number; text: string }[],
	targetLanguage: string,
	pageId: number,
	pageVersionId: number,
	title: string,
): Promise<{ number: number; text: string }[]> {
	const source_text = untranslatedElements
		.map((el) => JSON.stringify(el))
		.join("\n");
	const model = "gemini-1.5-pro-latest";
	const translatedText = await getGeminiModelResponse(
		geminiApiKey,
		model,
		title,
		source_text,
		targetLanguage,
	);

	const extractedTranslations = extractTranslations(translatedText);
  await  updatePageVersionTranslationInfoTitle(pageVersionId, targetLanguage, extractedTranslations[0].text);

	const systemUserId = await getOrCreateAIUser(model);

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

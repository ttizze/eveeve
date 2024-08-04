import { prisma } from "../../../utils/prisma";
import { getOrCreatePageId } from "../functions/mutations.server";
import { getOrCreatePageVersionId } from "../functions/mutations.server";
import { getOrCreateUserAITranslationInfo } from "../functions/mutations.server";
import { updateUserAITranslationInfo } from "../functions/mutations.server";
import { getOrCreateAIUser } from "../functions/mutations.server";
import { getOrCreatePageVersionTranslationInfo } from "../functions/mutations.server";
import { getOrCreateSourceTextIdAndPageVersionSourceText } from "../functions/mutations.server";
import { getGeminiModelResponse } from "../services/gemini";
import type { NumberedElement } from "../types";
import { extractTranslations } from "../utils/extractTranslations.server";
import { splitNumberedElements } from "../utils/splitNumberedElements.server";

export async function translate(
	geminiApiKey: string,
	aiModel: string,
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

	const userAITranslationInfo = await getOrCreateUserAITranslationInfo(
		userId,
		pageVersionId,
		targetLanguage,
	);

	await processTranslation(
		geminiApiKey,
		aiModel,
		userId,
		pageVersionId,
		targetLanguage,
		title,
		numberedElements,
	);

	return userAITranslationInfo.aiTranslationStatus;
}

export async function processTranslation(
	geminiApiKey: string,
	aiModel: string,
	userId: number,
	pageVersionId: number,
	targetLanguage: string,
	title: string,
	numberedElements: NumberedElement[],
) {
	await updateUserAITranslationInfo(
		userId,
		pageVersionId,
		targetLanguage,
		"in_progress",
		0,
	);
	try {
		const chunks = splitNumberedElements(numberedElements);
		const totalChunks = chunks.length;
		for (let i = 0; i < chunks.length; i++) {
			console.log(`Processing chunk ${i + 1} of ${totalChunks}`);

			await translateChunk(
				geminiApiKey,
				aiModel,
				chunks[i],
				targetLanguage,
				pageVersionId,
				title,
			);
			const progress = ((i + 1) / totalChunks) * 100;
			await updateUserAITranslationInfo(
				userId,
				pageVersionId,
				targetLanguage,
				"in_progress",
				progress,
			);
		}
		await updateUserAITranslationInfo(
			userId,
			pageVersionId,
			targetLanguage,
			"completed",
			100,
		);
	} catch (error) {
		console.error("Background translation job failed:", error);
		await updateUserAITranslationInfo(
			userId,
			pageVersionId,
			targetLanguage,
			"failed",
			0,
		);
	}
}

export async function translateChunk(
	geminiApiKey: string,
	aiModel: string,
	numberedElements: NumberedElement[],
	targetLanguage: string,
	pageVersionId: number,
	title: string,
) {
	const sourceTexts = await getSourceTexts(numberedElements, pageVersionId);
	const translatedText = await getTranslatedText(
		geminiApiKey,
		aiModel,
		numberedElements,
		targetLanguage,
		title,
	);

	const extractedTranslations = extractTranslations(translatedText);
	await getOrCreatePageVersionTranslationInfo(
		pageVersionId,
		targetLanguage,
		extractedTranslations[0].text,
	);

	await saveTranslations(
		extractedTranslations,
		sourceTexts,
		targetLanguage,
		aiModel,
	);
}
async function getSourceTexts(
	numberedElements: NumberedElement[],
	pageVersionId: number,
) {
	return Promise.all(
		numberedElements.map((element) =>
			getOrCreateSourceTextIdAndPageVersionSourceText(
				element.text,
				element.number,
				pageVersionId,
			),
		),
	);
}
async function getTranslatedText(
	geminiApiKey: string,
	aiModel: string,
	numberedElements: NumberedElement[],
	targetLanguage: string,
	title: string,
) {
	const source_text = numberedElements
		.map((el) => JSON.stringify(el))
		.join("\n");
	return getGeminiModelResponse(
		geminiApiKey,
		aiModel,
		title,
		source_text,
		targetLanguage,
	);
}

async function saveTranslations(
	extractedTranslations: NumberedElement[],
	sourceTexts: { id: number; number: number }[],
	targetLanguage: string,
	aiModel: string,
) {
	const systemUserId = await getOrCreateAIUser(aiModel);

	const translationData = extractedTranslations
		.map((translation) => {
			const sourceTextId = sourceTexts.find(
				(sourceText) => sourceText.number === translation.number,
			)?.id;
			if (!sourceTextId) {
				console.error(
					`Source text ID not found for translation number ${translation.number}`,
				);
				return null;
			}
			return {
				targetLanguage,
				text: translation.text,
				sourceTextId,
				userId: systemUserId,
			};
		})
		.filter((item): item is NonNullable<typeof item> => item !== null);

	if (translationData.length > 0) {
		await prisma.translateText.createMany({ data: translationData });
	}
}

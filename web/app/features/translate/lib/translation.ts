import { prisma } from "../../../utils/prisma";
import { getOrCreatePageId } from "../functions/mutations.server";
import { updateUserAITranslationInfo } from "../functions/mutations.server";
import { getOrCreateAIUser } from "../functions/mutations.server";
import { getOrCreatePageTranslationInfo } from "../functions/mutations.server";
import { getOrCreateSourceTextIdAndPageSourceText } from "../functions/mutations.server";
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
) {
	const pageId = await getOrCreatePageId(url, title, numberedContent);

	await updateUserAITranslationInfo(
		userId,
		url,
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
				pageId,
				title,
			);
			const progress = ((i + 1) / totalChunks) * 100;
			await updateUserAITranslationInfo(
				userId,
				url,
				targetLanguage,
				"in_progress",
				progress,
			);
		}
		await updateUserAITranslationInfo(
			userId,
			url,
			targetLanguage,
			"completed",
			100,
		);
	} catch (error) {
		console.error("Background translation job failed:", error);
		await updateUserAITranslationInfo(userId, url, targetLanguage, "failed", 0);
	}
}

export async function translateChunk(
	geminiApiKey: string,
	aiModel: string,
	numberedElements: NumberedElement[],
	targetLanguage: string,
	pageId: number,
	title: string,
) {
	const sourceTexts = await getSourceTexts(numberedElements, pageId);
	const translatedText = await getTranslatedText(
		geminiApiKey,
		aiModel,
		numberedElements,
		targetLanguage,
		title,
	);

	const extractedTranslations = extractTranslations(translatedText);
	await getOrCreatePageTranslationInfo(
		pageId,
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
	pageId: number,
) {
	return Promise.all(
		numberedElements.map((element) =>
			getOrCreateSourceTextIdAndPageSourceText(
				element.text,
				element.number,
				pageId,
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

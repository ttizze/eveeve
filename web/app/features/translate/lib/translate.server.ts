import { prisma } from "../../../utils/prisma";
import { updateUserAITranslationInfo } from "../functions/mutations.server";
import { getOrCreateAIUser } from "../functions/mutations.server";
import { getOrCreatePageTranslationInfo } from "../functions/mutations.server";
import { getLatestSourceTexts } from "../functions/mutations.server";
import { getGeminiModelResponse } from "../services/gemini";
import type { NumberedElement } from "../types";
import type { TranslateJobParams } from "../types";
import { extractTranslations } from "../utils/extractTranslations.server";
import { splitNumberedElements } from "../utils/splitNumberedElements.server";

export async function translate(params: TranslateJobParams) {
	try {
		await updateUserAITranslationInfo(
			params.userAITranslationInfoId,
			"in_progress",
			0,
		);
		const sortedNumberedElements = params.numberedElements.sort(
			(a, b) => a.number - b.number,
		);

		const chunks = splitNumberedElements(sortedNumberedElements);
		const totalChunks = chunks.length;
		for (let i = 0; i < chunks.length; i++) {
			console.log(`Processing chunk ${i + 1} of ${totalChunks}`);
			console.log(chunks[i]);

			await translateChunk(
				params.geminiApiKey,
				params.aiModel,
				chunks[i],
				params.targetLanguage,
				params.pageId,
				params.title,
			);
			const progress = ((i + 1) / totalChunks) * 100;
			await updateUserAITranslationInfo(
				params.userAITranslationInfoId,
				"in_progress",
				progress,
			);
		}
		await updateUserAITranslationInfo(
			params.userAITranslationInfoId,
			"completed",
			100,
		);
	} catch (error) {
		console.error("Background translation job failed:", error);
		await updateUserAITranslationInfo(
			params.userAITranslationInfoId,
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
	pageId: number,
	title: string,
) {
	const sourceTexts = await getLatestSourceTexts(pageId);
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
					`Source text ID not found for translation number ${translation.number} ${translation.text}`,
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

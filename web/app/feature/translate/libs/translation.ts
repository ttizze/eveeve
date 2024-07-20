import { getOrCreatePageId } from "../../../libs/pageService";
import { getOrCreatePageVersionId } from "../../../libs/pageVersion";
import {
	getOrCreateUserAITranslationInfo,
	updateUserAITranslationInfo,
} from "../../../libs/userAITranslationInfo";
import type { NumberedElement } from "../../../routes/translate/types";
import {
	getOrCreateTranslations,
	splitNumberedElements,
} from "./translationUtils";

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

	const userAITranslationHistory = await getOrCreateUserAITranslationInfo(
		userId,
		pageVersionId,
		targetLanguage,
	);

	if (userAITranslationHistory.aiTranslationStatus === "completed") {
		return userAITranslationHistory.aiTranslationStatus;
	}

	await processTranslation(
		geminiApiKey,
		userId,
		pageId,
		pageVersionId,
		targetLanguage,
		title,
		numberedElements,
	);

	return userAITranslationHistory.aiTranslationStatus;
}

export async function processTranslation(
	geminiApiKey: string,
	userId: number,
	pageId: number,
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

			await getOrCreateTranslations(
				geminiApiKey,
				chunks[i],
				targetLanguage,
				pageId,
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

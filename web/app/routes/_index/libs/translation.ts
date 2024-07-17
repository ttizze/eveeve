import type { Job } from "bull";
import { getOrCreatePageId } from "../../../libs/pageService";
import { getOrCreatePageVersionId } from "../../../libs/pageVersion";
import {
	getOrCreateUserAITranslationInfo,
	updateUserAITranslationInfo,
} from "../../../libs/userAITranslationInfo";
import { updateUserReadHistory } from "../../../libs/userReadHistory";
import type { NumberedElement } from "../../translate/types";
import {
	getOrCreateTranslations,
	splitNumberedElements,
} from "./translationUtils";
import { setupUserQueue } from "./userTranslationqueueService";

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
	await updateUserReadHistory(userId, pageVersionId, 0);

	if (userAITranslationHistory.aiTranslationStatus === "completed") {
		return userAITranslationHistory.aiTranslationStatus;
	}

	const userTranslationQueue = setupUserQueue(userId, geminiApiKey);
	await userTranslationQueue.add({
		pageId,
		pageVersionId,
		targetLanguage,
		title,
		numberedElements,
	});

	return userAITranslationHistory.aiTranslationStatus;
}

export async function processTranslationJob(
	job: Job,
	geminiApiKey: string,
	userId: number,
) {
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

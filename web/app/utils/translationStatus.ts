import { PrismaClient } from "@prisma/client";
import type {
	TranslationStatus,
	TranslationStatusRecord,
} from "../routes/_index/types";

const prisma = new PrismaClient();

export async function getOrCreateTranslationStatus(
	pageVersionId: number,
	targetLanguage: string,
): Promise<TranslationStatusRecord> {
	let translationStatus = (await prisma.translationStatus.findUnique({
		where: {
			pageVersionId_language: {
				pageVersionId,
				language: targetLanguage,
			},
		},
	})) as TranslationStatusRecord | null;

	if (!translationStatus) {
		translationStatus = (await prisma.translationStatus.create({
			data: {
				pageVersionId,
				language: targetLanguage,
				status: "in_progress" as TranslationStatus,
			},
		})) as TranslationStatusRecord;
	}

	return translationStatus;
}

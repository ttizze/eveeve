import { z } from "zod";

export type TranslationStatus = "pending" | "in_progress" | "completed" | "failed";

export interface TranslationStatusRecord {
	id: number;
	pageVersionId: number;
	language: string;
	status: TranslationStatus;
}

export const geminiApiKeySchema = z.object({
	geminiApiKey: z.string().min(1, "API key is required"),
});

export type UserReadHistoryItem = {
  id: number;
  readAt: Date;
  pageVersion: {
    id: number;
    title: string;
    page: {
      url: string;
    };
    pageVersionTranslationInfo: Array<{
      targetLanguage: string;
      translationTitle: string;
      translationStatus: string;
      translationProgress: number;
    }>;
  };
};
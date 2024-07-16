import { z } from "zod";

export type TranslationStatus = "pending" | "in_progress" | "completed";

export interface TranslationStatusRecord {
	id: number;
	pageVersionId: number;
	language: string;
	status: TranslationStatus;
}

export const geminiApiKeySchema = z.object({
	geminiApiKey: z.string().min(1, "API key is required"),
});

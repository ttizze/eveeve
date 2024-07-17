import { z } from "zod";

export const geminiApiKeySchema = z.object({
	geminiApiKey: z.string().min(1, "API key is required"),
});

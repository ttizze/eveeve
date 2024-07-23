import type { User } from "@prisma/client";

export type SafeUser = Omit<
	User,
	"password" | "geminiApiKey" | "openAIApiKey" | "claudeApiKey"
>;

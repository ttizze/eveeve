import type { User } from "@prisma/client";

export type SanitizedUser = Omit<
	User,
	| "email"
	| "password"
	| "geminiApiKey"
	| "openAIApiKey"
	| "claudeApiKey"
	| "provider"
	| "plan"
>;

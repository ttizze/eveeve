import type { User } from "@prisma/client";

export type SanitizedUser = Omit<
	User,
	| "password"
	| "geminiApiKey"
	| "openAIApiKey"
	| "claudeApiKey"
	| "email"
	| "provider"
	| "id"
	| "plan"
>;

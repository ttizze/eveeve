import type { TranslateText, Vote } from "@prisma/client";
import { z } from "zod";
export type UserVote = Pick<Vote, "id" | "isUpvote" | "updatedAt">;

export type TranslationWithVote = Pick<
	TranslateText,
	"id" | "text" | "point"
> & {
	userName: string;
	userVote: UserVote | null;
};

export interface SourceTextInfoWithTranslations {
	number: number;
	sourceTextId: number;
	translationsWithVotes: TranslationWithVote[];
}

export interface LatestPageVersionWithTranslations {
	title: string;
	url: string;
	content: string;
	sourceTextInfoWithTranslations: SourceTextInfoWithTranslations[];
	userId: number | null;
}

export const voteSchema = z.object({
	intent: z.literal("vote"),
	translateTextId: z.number(),
	isUpvote: z.preprocess((val) => val === "true", z.boolean()),
});

export const addTranslationSchema = z.object({
	intent: z.literal("add"),
	sourceTextId: z.number(),
	text: z
		.string()
		.min(1, "Translation cannot be empty")
		.max(30000, "Translation is too long")
		.transform((val) => val.trim()),
});

export const actionSchema = z.discriminatedUnion("intent", [
	addTranslationSchema,
	voteSchema,
]);

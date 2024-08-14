import type { TranslateText, Vote } from "@prisma/client";
import { z } from "zod";
export type UserVote = Pick<Vote, "id" | "isUpvote" | "updatedAt">;

export type TranslationWithVote = Pick<
	TranslateText,
	"id" | "text" | "point" | "createdAt"
> & {
	displayName: string;
	userVote: UserVote | null;
};

export interface SourceTextWithTranslations {
	sourceTextId: number;
	number: number;
	translationsWithVotes: TranslationWithVote[];
}

export interface PageWithTranslations {
	id: number;
	title: string;
	translationTitle: string | null;
	user: { displayName: string; userName: string; image: string };
	createdAt: Date;
	slug: string;
	content: string;
	sourceTextWithTranslations: SourceTextWithTranslations[];
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

export const translateSchema = z.object({
	intent: z.literal("translate"),
	pageId: z.number(),
	aiModel: z.string().min(1, "モデルを選択してください"),
});

export const actionSchema = z.discriminatedUnion("intent", [
	addTranslationSchema,
	voteSchema,
	translateSchema,
]);

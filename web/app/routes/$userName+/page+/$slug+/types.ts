import type { SourceText, TranslateText, Vote } from "@prisma/client";
import { z } from "zod";

export type UserVote = Pick<Vote, "id" | "isUpvote" | "updatedAt">;

export type TranslationWithVote = Pick<
	TranslateText,
	"id" | "text" | "point" | "createdAt"
> & {
	displayName: string;
	userName: string;
	userVote: UserVote | null;
};

export interface SourceTextWithTranslations {
	sourceText: SourceText;
	translationsWithVotes: TranslationWithVote[];
}

export type PageWithTranslations = {
	id: number;
	title: string;
	sourceLanguage: string;
	user: { displayName: string; userName: string; icon: string };
	createdAt: Date;
	slug: string;
	content: string;
	isPublished: boolean;
	isArchived: boolean;
	sourceTextWithTranslations: SourceTextWithTranslations[];
};

export const translateSchema = z.object({
	intent: z.literal("translate"),
	pageId: z.number(),
	aiModel: z.string().min(1, "モデルを選択してください"),
});

export const actionSchema = z.discriminatedUnion("intent", [translateSchema]);

import type {
	Page,
	SourceText,
	Tag,
	TagPage,
	TranslateText,
	Vote,
} from "@prisma/client";
import { z } from "zod";
import type { SanitizedUser } from "~/types";

export type TranslationWithVote = {
	translateText: TranslateText;
	user: SanitizedUser;
	Vote: Vote | null;
};

export type SourceTextWithTranslations = {
	sourceText: SourceText;
	translationsWithVotes: TranslationWithVote[];
	bestTranslationWithVote: TranslationWithVote | null;
};
export type TagPageWithTag = TagPage & {
	tag: Tag;
};

export type PageWithTranslations = {
	page: Page;
	user: SanitizedUser;
	tagPages: TagPageWithTag[];
	sourceTextWithTranslations: SourceTextWithTranslations[];
};

export const translateSchema = z.object({
	intent: z.literal("translate"),
	pageId: z.number(),
	aiModel: z.string().min(1, "モデルを選択してください"),
});

export const actionSchema = z.discriminatedUnion("intent", [translateSchema]);

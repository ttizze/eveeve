import type { TranslateText, Vote } from "@prisma/client";

// UserVoteは既存のVoteタイプを基に定義
export type UserVote = Pick<Vote, "id" | "isUpvote" | "updatedAt">;

// TranslationDataはTranslateTextを基に、必要なフィールドを選択し拡張
export type TranslationData = Pick<TranslateText, "id" | "text" | "point"> & {
	userName: string;
	userVote: UserVote | null;
};

export interface SourceTextTranslations {
	number: number;
	translations: TranslationData[];
}

export interface LoaderData {
	title: string;
	url: string;
	content: string;
	translations: SourceTextTranslations[];
	userId: number | null;
}

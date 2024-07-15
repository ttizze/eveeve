import type { Vote } from "@prisma/client";

export interface TranslationData {
  id: number;
  text: string;
  point: number;
  userName: string;
  userVoteStatus: 'upvoted' | 'downvoted' | 'not_voted';
}

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

export interface TranslateText {
  id: number;
  text: string;
  point: number;
  votes: Vote[];
  user: { name: string };
}

export interface SourceText {
  number: number;
  translateTexts: TranslateText[];
}

export interface PageVersion {
  title: string;
  url: string;
  content: string;
  sourceTexts: SourceText[];
}


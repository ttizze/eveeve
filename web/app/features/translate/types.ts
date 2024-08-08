export type NumberedElement = {
	number: number;
	text: string;
};

export interface TranslateJobParams {
	geminiApiKey: string;
	aiModel: string;
	userId: number;
	targetLanguage: string;
	title: string;
	numberedContent: string;
	numberedElements: NumberedElement[];
	sourceUrl: string | null;
	slug: string;
}

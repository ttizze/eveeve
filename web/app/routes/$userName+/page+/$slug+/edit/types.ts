export type NumberedElement = {
	number: number;
	text: string;
	sourceTextId: number | null;
};

export interface TranslateJobParams {
	geminiApiKey: string;
	aiModel: string;
	userId: number;
	targetLanguage: string;
	pageId: number;
	title: string;
	numberedContent: string;
	numberedElements: NumberedElement[];
	slug: string;
}

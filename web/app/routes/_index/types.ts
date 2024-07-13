export type NumberedElement = {
  number: number;
  text: string;
};

export type TranslationStatus = 'pending' | 'in_progress' | 'completed';

export interface TranslationStatusRecord {
  id: number;
  pageVersionId: number;
  language: string;
  status: TranslationStatus;
}
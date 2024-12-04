import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import type { SourceTextWithTranslations } from "../../types";
import { TranslationSection } from "./TranslationSection";

interface SourceTextAndTranslationSectionProps {
	sourceTextWithTranslations: SourceTextWithTranslations;
	elements: string | ReactNode | ReactNode[];
	isPublished?: boolean;
	sourceLanguage: string;
	targetLanguage: string;
	sourceTextClassName?: string;
	onOpenAddAndVoteTranslations: (sourceTextId: number) => void;
	showOriginal: boolean;
	showTranslation: boolean;
	selectedSourceTextId: number | null;
	onSelectedRef?: (el: HTMLDivElement | null) => void;
}

export function SourceTextAndTranslationSection({
	sourceTextWithTranslations,
	elements,
	isPublished,
	sourceLanguage,
	targetLanguage,
	sourceTextClassName,
	onOpenAddAndVoteTranslations,
	showOriginal = true,
	showTranslation = true,
	selectedSourceTextId,
	onSelectedRef,
}: SourceTextAndTranslationSectionProps) {
	return (
		<>
			{showOriginal && (
				<span
					className={`inline-block ${
						sourceTextWithTranslations.translationsWithVotes.length === 0 ||
						!showTranslation
							? "text-gray-700 dark:text-gray-200"
							: "text-gray-300 dark:text-gray-600"
					} ${sourceTextClassName}`}
				>
					{isPublished === false && <Lock className="h-6 w-6 mr-1 inline" />}
					{elements}
				</span>
			)}
			{showTranslation &&
				sourceLanguage !== targetLanguage &&
				sourceTextWithTranslations.translationsWithVotes.length > 0 && (
					<TranslationSection
						key={`translation-${sourceTextWithTranslations.sourceText.id}`}
						sourceTextWithTranslations={sourceTextWithTranslations}
						onOpenAddAndVoteTranslations={onOpenAddAndVoteTranslations}
						selectedSourceTextId={selectedSourceTextId}
						onSelectedRef={onSelectedRef}
					/>
				)}
		</>
	);
}

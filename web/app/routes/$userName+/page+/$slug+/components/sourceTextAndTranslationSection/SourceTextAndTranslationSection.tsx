import { Lock } from "lucide-react";
import type { SourceTextWithTranslations } from "../../types";
import { TranslationSection } from "./TranslationSection";
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
}: {
	sourceTextWithTranslations: SourceTextWithTranslations;
	elements: string | React.ReactNode | React.ReactNode[];
	isPublished?: boolean;
	sourceLanguage: string;
	targetLanguage: string;
	sourceTextClassName?: string;
	onOpenAddAndVoteTranslations: (sourceTextId: number) => void;
	showOriginal: boolean;
	showTranslation: boolean;
}) {
	return (
		<>
			{showOriginal && (
				<span
					className={`inline-block ${
						sourceTextWithTranslations.translationsWithVotes.length === 0
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
					/>
				)}
		</>
	);
}

import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import type { SourceTextWithTranslations } from "../../types";
import { TranslationSection } from "./TranslationSection";

interface SourceTextAndTranslationSectionProps {
	sourceTextWithTranslations: SourceTextWithTranslations;
	elements: string | ReactNode | ReactNode[];
	isPublished?: boolean;
	sourceTextClassName?: string;
	showOriginal: boolean;
	showTranslation: boolean;
	currentUserName: string | undefined;
}

export function SourceTextAndTranslationSection({
	sourceTextWithTranslations,
	elements,
	isPublished,
	sourceTextClassName,
	showOriginal = true,
	showTranslation = true,
	currentUserName,
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
			{showTranslation && (
				<TranslationSection
					key={`translation-${sourceTextWithTranslations.sourceText.id}`}
					sourceTextWithTranslations={sourceTextWithTranslations}
					currentUserName={currentUserName}
				/>
			)}
		</>
	);
}

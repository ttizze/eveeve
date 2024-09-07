import { Lock } from "lucide-react";
import type { SourceTextWithTranslations } from "../../types";
import { TranslationSection } from "./TranslationSection";
export function SourceTextAndTranslationSection({
	sourceTextWithTranslations,
	isPublished,
	currentUserName,
	sourceLanguage,
	targetLanguage,
	sourceTextClassName,
	onOpenAddAndVoteTranslations,
}: {
	sourceTextWithTranslations: SourceTextWithTranslations;
	isPublished?: boolean;
	currentUserName: string | undefined;
	sourceLanguage: string;
	targetLanguage: string;
	sourceTextClassName?: string;
	onOpenAddAndVoteTranslations: (sourceTextId: number) => void;
}) {
	const spanClassName = sourceTextClassName
		? `inline-block px-4 ${sourceTextClassName}`
		: "inline-block px-4";

	return (
		<>
			<span className={spanClassName}>
				{isPublished === false && <Lock className="h-6 w-6 mr-1 inline" />}
				{sourceTextWithTranslations.sourceText.text}
			</span>
			{sourceLanguage === targetLanguage ||
			sourceTextWithTranslations.translationsWithVotes.length === 0 ? null : (
				<TranslationSection
					key={`translation-${sourceTextWithTranslations.sourceText.id}`}
					sourceTextWithTranslations={sourceTextWithTranslations}
					onOpenAddAndVoteTranslations={onOpenAddAndVoteTranslations}
				/>
			)}
		</>
	);
}

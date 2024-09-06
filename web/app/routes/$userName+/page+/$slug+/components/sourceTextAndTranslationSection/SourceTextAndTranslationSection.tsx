import { Lock } from "lucide-react";
import type { SourceTextWithTranslations } from "../../types";
import { TranslationSection } from "./TranslationSection";
export function SourceTextAndTranslationSection({
	sourceTextWithTranslation,
	isPublished,
	currentUserName,
	sourceLanguage,
	targetLanguage,
	sourceTextClassName,
}: {
	sourceTextWithTranslation: SourceTextWithTranslations;
	isPublished?: boolean;
	currentUserName: string | undefined;
	sourceLanguage: string;
	targetLanguage: string;
	sourceTextClassName?: string;
}) {
	const spanClassName = sourceTextClassName
		? `inline-block px-4 ${sourceTextClassName}`
		: "inline-block px-4";

	return (
		<>
			<span className={spanClassName}>
				{isPublished === false && <Lock className="h-6 w-6 mr-1 inline" />}
				{sourceTextWithTranslation.sourceText.text}
			</span>
			{sourceTextWithTranslation.translationsWithVotes.length < 0 ||
			sourceLanguage === targetLanguage ? null : (
				<TranslationSection
					key={`translation-${sourceTextWithTranslation.sourceText.id}`}
					translationsWithVotes={
						sourceTextWithTranslation?.translationsWithVotes
					}
					currentUserName={currentUserName}
					sourceTextId={sourceTextWithTranslation.sourceText.id}
					sourceLanguage={sourceLanguage}
					targetLanguage={targetLanguage}
				/>
			)}
		</>
	);
}

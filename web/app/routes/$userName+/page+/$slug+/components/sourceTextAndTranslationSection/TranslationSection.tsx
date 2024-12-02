import type { UseFloatingReturn } from "@floating-ui/react";
import { Languages, Plus } from "lucide-react";
import { useHydrated } from "remix-utils/use-hydrated";
import type { SourceTextWithTranslations } from "../../types";
import { sanitizeAndParseText } from "../../utils/sanitize-and-parse-text.client";

interface TranslationSectionProps {
	sourceTextWithTranslations: SourceTextWithTranslations;
	onOpenAddAndVoteTranslations: (sourceTextId: number) => void;
	floatingRefs: UseFloatingReturn["refs"];
	isSelected: boolean;
}

export function TranslationSection({
	sourceTextWithTranslations,
	onOpenAddAndVoteTranslations,
	floatingRefs,
	isSelected,
}: TranslationSectionProps) {
	const isHydrated = useHydrated();

	const { bestTranslationWithVote, sourceText } = sourceTextWithTranslations;
	const sanitizedAndParsedText = bestTranslationWithVote ? (
		isHydrated ? (
			sanitizeAndParseText(bestTranslationWithVote.translateText.text)
		) : (
			bestTranslationWithVote.translateText.text
		)
	) : (
		<span className="flex items-center gap-2">
			<Plus size={24} />
			<Languages size={24} />
		</span>
	);

	return (
		<span
			className="group relative block rounded-md"
			ref={isSelected ? floatingRefs.setReference : undefined}
		>
			<span
				className="notranslate inline-block  py-2 text-gray-700 dark:text-gray-200"
				onMouseUp={(e) => {
					if (window.getSelection()?.toString()) return;
					if (e.button === 2) return;
					onOpenAddAndVoteTranslations(sourceText.id);
				}}
			>
				{sanitizedAndParsedText}
			</span>
		</span>
	);
}

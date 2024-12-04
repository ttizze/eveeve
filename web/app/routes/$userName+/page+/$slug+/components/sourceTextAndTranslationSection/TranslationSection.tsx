import type { UseFloatingReturn } from "@floating-ui/react";
import { Languages, Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import { useHydrated } from "remix-utils/use-hydrated";
import type { SourceTextWithTranslations } from "../../types";
import { sanitizeAndParseText } from "../../utils/sanitize-and-parse-text.client";

interface TranslationSectionProps {
	sourceTextWithTranslations: SourceTextWithTranslations;
	onOpenAddAndVoteTranslations: (sourceTextId: number) => void;
	selectedSourceTextId: number | null;
	onSelectedRef?: (el: HTMLDivElement | null) => void;
}

export function TranslationSection({
	sourceTextWithTranslations,
	onOpenAddAndVoteTranslations,
	selectedSourceTextId,
	onSelectedRef,
}: TranslationSectionProps) {
	const isHydrated = useHydrated();
	const isSelected =
		selectedSourceTextId === sourceTextWithTranslations.sourceText.id;
	const contentRef = useRef<HTMLDivElement>(null);

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

	useEffect(() => {
		if (onSelectedRef) {
			onSelectedRef(isSelected ? contentRef.current : null);
		}
	}, [isSelected, onSelectedRef]);

	return (
		<div
			ref={contentRef}
			className={`group relative ${
				isSelected ? "bg-gray-50 dark:bg-gray-800 rounded-lg" : ""
			}`}
			style={{
				display: "grid",
				gridTemplateRows: isSelected ? "1fr auto" : "1fr 0fr",
				transition: "grid-template-rows 0.2s, background-color 0.2s",
			}}
		>
			<span
				className="notranslate inline-block py-2 text-gray-700 dark:text-gray-200"
				onMouseUp={(e) => {
					if (window.getSelection()?.toString()) return;
					if (e.button === 2) return;
					onOpenAddAndVoteTranslations(sourceText.id);
				}}
			>
				{sanitizedAndParsedText}
			</span>
			<div style={{ overflow: "hidden" }} />
		</div>
	);
}

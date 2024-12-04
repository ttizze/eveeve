import { Link } from "@remix-run/react";
import { Languages, Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import { useHydrated } from "remix-utils/use-hydrated";
import { VoteButtons } from "~/routes/resources+/vote-buttons";
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
	if (!bestTranslationWithVote)
		return (
			<span className="flex items-center gap-2">
				<Plus size={24} />
				<Languages size={24} />
			</span>
		);
	const sanitizedAndParsedText = isHydrated
		? sanitizeAndParseText(bestTranslationWithVote.translateText.text)
		: bestTranslationWithVote.translateText.text;

	useEffect(() => {
		if (onSelectedRef) {
			onSelectedRef(isSelected ? contentRef.current : null);
		}
	}, [isSelected, onSelectedRef]);

	return (
		<div
			ref={contentRef}
			className={"group relative"}
			style={{
				display: "grid",
				gridTemplateRows: isSelected ? "1fr auto" : "1fr 0fr",
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
			{isSelected && (
				<div className="flex items-center justify-end">
					<Link
						to={`/${bestTranslationWithVote?.user.userName}`}
						className="!no-underline mr-2"
					>
						<p className="text-sm text-gray-500 text-right flex justify-end items-center  ">
							by: {bestTranslationWithVote?.user.displayName}
						</p>
					</Link>
					<VoteButtons translationWithVote={bestTranslationWithVote} />
				</div>
			)}
		</div>
	);
}

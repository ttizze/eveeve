import { FilePenLine, X } from "lucide-react";
import { useMemo, useState } from "react";
import { getBestTranslation } from "../functions/get-best-translation.client";
import { sanitizeAndParseText } from "../functions/sanitize-and-parse-text.client";
import type { TranslationWithVote } from "../types";
import { AddAndVoteTranslations } from "./AddAndVoteTranslations";
interface TranslationProps {
	translationsWithVotes: TranslationWithVote[];
	userId: number | null;
	sourceTextId: number;
}

function ToggleButton({
	isExpanded,
	onClick,
}: { isExpanded: boolean; onClick: () => void }) {
	const Icon = isExpanded ? X : FilePenLine;
	const label = isExpanded
		? "Close translation options"
		: "Show translation options";

	return (
		<button
			type="button"
			className="absolute top-2 right-2 p-1  z-20"
			onClick={onClick}
			aria-label={label}
			title={label}
		>
			<Icon className="w-6 h-6 opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity duration-200" />
		</button>
	);
}

export function Translation({
	translationsWithVotes,
	userId,
	sourceTextId,
}: TranslationProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const bestTranslationWithVote = useMemo(
		() => getBestTranslation(translationsWithVotes),
		[translationsWithVotes],
	);

	const alternativeTranslationsWithVotes = useMemo(
		() =>
			translationsWithVotes.filter((t) => t.id !== bestTranslationWithVote.id),
		[translationsWithVotes, bestTranslationWithVote],
	);

	const sanitizedAndParsedText = useMemo(() => {
		const sanitized = sanitizeAndParseText(bestTranslationWithVote.text);
		return sanitized;
	}, [bestTranslationWithVote.text]);

	return (
		<div className="group relative">
			<div className="w-full notranslate mt-2 pt-2 border-t border-gray-200">
				{sanitizedAndParsedText}
				<ToggleButton
					isExpanded={isExpanded}
					onClick={() => setIsExpanded(!isExpanded)}
				/>
			</div>
			{isExpanded && (
				<div className="absolute top-0 left-0 right-0 z-10  border bg-white dark:bg-gray-900 rounded-xl shadow-xl dark:shadow-white/10  transition-all duration-500 ease-in-out">
					<AddAndVoteTranslations
						bestTranslationWithVote={bestTranslationWithVote}
						alternativeTranslationsWithVotes={alternativeTranslationsWithVotes}
						userId={userId}
						sourceTextId={sourceTextId}
					/>
				</div>
			)}
		</div>
	);
}

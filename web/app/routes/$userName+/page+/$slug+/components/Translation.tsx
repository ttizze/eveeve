import { MoreVertical, X } from "lucide-react";
import { useMemo, useState } from "react";
import { getBestTranslation } from "../lib/get-best-translation.client";
import { sanitizeAndParseText } from "../lib/sanitize-and-parse-text.client";
import type { TranslationWithVote } from "../types";
import { AddAndVoteTranslations } from "./AddAndVoteTranslations";
interface TranslationProps {
	translationsWithVotes: TranslationWithVote[];
	currentUserName: string | null;
	sourceTextId: number;
}

function ToggleButton({
	isExpanded,
	onClick,
}: { isExpanded: boolean; onClick: () => void }) {
	const Icon = isExpanded ? X : MoreVertical;
	const label = isExpanded
		? "Close translation options"
		: "Show translation options";

	return (
		<button
			type="button"
			className={`absolute top-2  -right-1  rounded-md ${isExpanded ? " z-20 bg-transparent" : "z-0 "}`}
			onClick={onClick}
			aria-label={label}
			title={label}
		>
			<Icon className="w-5 h-5 text-gray-500 " />
		</button>
	);
}

export function Translation({
	translationsWithVotes,
	currentUserName,
	sourceTextId,
}: TranslationProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const bestTranslationWithVote = useMemo(
		() =>
			translationsWithVotes.length > 0
				? getBestTranslation(translationsWithVotes)
				: null,
		[translationsWithVotes],
	);

	const alternativeTranslationsWithVotes = useMemo(
		() =>
			bestTranslationWithVote
				? translationsWithVotes.filter(
						(t) => t.id !== bestTranslationWithVote.id,
					)
				: [],
		[translationsWithVotes, bestTranslationWithVote],
	);

	const sanitizedAndParsedText = useMemo(() => {
		if (!bestTranslationWithVote) return "add translation";
		return sanitizeAndParseText(bestTranslationWithVote.text);
	}, [bestTranslationWithVote]);

	return (
		<div className="group relative">
			<span className="notranslate mt-2 pl-4 pr-5 inline-block">
				{sanitizedAndParsedText}
				<ToggleButton
					isExpanded={isExpanded}
					onClick={() => setIsExpanded(!isExpanded)}
				/>
			</span>
			{isExpanded && (
				<div className="mx-[-1rem] absolute -top-0 left-0 right-0 z-10  border bg-white dark:bg-gray-900 rounded-xl shadow-lg shadow-gray-800/10  dark:shadow-white/10  transition-all duration-500 ease-in-out">
					<AddAndVoteTranslations
						bestTranslationWithVote={bestTranslationWithVote}
						alternativeTranslationsWithVotes={alternativeTranslationsWithVotes}
						currentUserName={currentUserName}
						sourceTextId={sourceTextId}
					/>
				</div>
			)}
		</div>
	);
}

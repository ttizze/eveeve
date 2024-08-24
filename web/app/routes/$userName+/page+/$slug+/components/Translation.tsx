import { Ellipsis, X } from "lucide-react";
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
	const Icon = isExpanded ? X : Ellipsis;
	const label = isExpanded
		? "Close translation options"
		: "Show translation options";

	return (
		<button
			type="button"
			className={`absolute top-0 right-2 rounded-md ${isExpanded ? " z-20 bg-transparent" : "z-0 "}`}
			onClick={onClick}
			aria-label={label}
			title={label}
		>
			<Icon className="w-5 h-5 text-gray-400 " />
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
		() => getBestTranslation(translationsWithVotes),
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
		if (!bestTranslationWithVote) return null;
		return sanitizeAndParseText(bestTranslationWithVote.text);
	}, [bestTranslationWithVote]);

	if (!bestTranslationWithVote || !sanitizedAndParsedText) {
		return null;
	}

	return (
		<div className="group relative rounded-xl bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 ">
			<div className="notranslate mt-2 py-3 px-2">
				{sanitizedAndParsedText}
				<ToggleButton
					isExpanded={isExpanded}
					onClick={() => setIsExpanded(!isExpanded)}
				/>
			</div>
			{isExpanded && (
				<div className="absolute -top-2 left-0 right-0 z-10  border bg-white dark:bg-gray-900 rounded-xl shadow-lg shadow-gray-800/10  dark:shadow-white/10  transition-all duration-500 ease-in-out">
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

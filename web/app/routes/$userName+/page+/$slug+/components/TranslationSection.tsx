import { MoreVertical, X } from "lucide-react";
import { Languages, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useHydrated } from "remix-utils/use-hydrated";
import { getBestTranslation } from "../lib/get-best-translation";
import { sanitizeAndParseText } from "../lib/sanitize-and-parse-text.client";
import type { TranslationWithVote } from "../types";
import { AddAndVoteTranslations } from "./AddAndVoteTranslations";

interface TranslationSectionProps {
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
			className={`absolute top-2 right-0 md:right-1 ${isExpanded ? " z-20 bg-transparent" : "z-0 "}`}
			onClick={onClick}
			aria-label={label}
			title={label}
		>
			<Icon className="w-5 h-5 text-gray-500 " />
		</button>
	);
}

export function TranslationSection({
	translationsWithVotes,
	currentUserName,
	sourceTextId,
}: TranslationSectionProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const isHydrated = useHydrated();
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
		if (!bestTranslationWithVote)
			return (
				<span className="flex items-center gap-2">
					<Plus size={24} />
					<Languages size={24} />
				</span>
			);
		if (isHydrated) {
			return sanitizeAndParseText(bestTranslationWithVote.text);
		}
		return bestTranslationWithVote.text;
	}, [bestTranslationWithVote, isHydrated]);

	return (
		<span className="group relative block rounded-md">
			<span
				className="notranslate  inline-block cursor-pointer pl-4 pr-5 py-2  "
				onClick={() => setIsExpanded(!isExpanded)}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						setIsExpanded(!isExpanded);
					}
				}}
			>
				<span className="bg-gradient-to-b from-transparent from-60%  to-blue-gray-300 to-60% dark:to-blue-gray-700 hover:to-blue-gray-300 dark:hover:to-blue-gray-600 ">
					{sanitizedAndParsedText}
				</span>
				<ToggleButton
					isExpanded={isExpanded}
					onClick={() => setIsExpanded(!isExpanded)}
				/>
			</span>
			{isExpanded && (
				<span className="mx-[-1rem] absolute -top-0 left-0 right-0 z-10  border bg-white dark:bg-gray-900 rounded-xl shadow-lg shadow-gray-800/10  dark:shadow-white/10  transition-all duration-500 ease-in-out">
					<AddAndVoteTranslations
						bestTranslationWithVote={bestTranslationWithVote}
						alternativeTranslationsWithVotes={alternativeTranslationsWithVotes}
						currentUserName={currentUserName}
						sourceTextId={sourceTextId}
					/>
				</span>
			)}
		</span>
	);
}

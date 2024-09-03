import { MoreVertical, X } from "lucide-react";
import { Languages, Plus } from "lucide-react";
import { memo, useState } from "react";
import { useHydrated } from "remix-utils/use-hydrated";
import type { TranslationWithVote } from "../types";
import { getBestTranslation } from "../utils/get-best-translation";
import { sanitizeAndParseText } from "../utils/sanitize-and-parse-text.client";
import { AddAndVoteTranslations } from "./AddAndVoteTranslations";

interface TranslationSectionProps {
	translationsWithVotes: TranslationWithVote[] | undefined;
	currentUserName: string | undefined;
	sourceTextId: number;
	sourceLanguage: string;
	targetLanguage: string;
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
	sourceLanguage,
	targetLanguage,
}: TranslationSectionProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const isHydrated = useHydrated();

	if (!translationsWithVotes || sourceLanguage === targetLanguage) {
		return null;
	}

	const bestTranslationWithVote = getBestTranslation(translationsWithVotes);

	const alternativeTranslationsWithVotes = bestTranslationWithVote
		? translationsWithVotes.filter((t) => t.id !== bestTranslationWithVote.id)
		: [];

	const sanitizedAndParsedText = bestTranslationWithVote ? (
		isHydrated ? (
			sanitizeAndParseText(bestTranslationWithVote.text)
		) : (
			bestTranslationWithVote.text
		)
	) : (
		<span className="flex items-center gap-2">
			<Plus size={24} />
			<Languages size={24} />
		</span>
	);

	return (
		<span className="group relative block rounded-md  bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 ">
			<span
				className="notranslate  inline-block cursor-pointer pl-4 pr-5 py-2"
				onClick={() => setIsExpanded(!isExpanded)}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						setIsExpanded(!isExpanded);
					}
				}}
			>
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
		</span>
	);
}

export const MemoizedTranslationSection = memo(TranslationSection);

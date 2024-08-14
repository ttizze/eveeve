import { sanitizeAndParseText } from "../lib/sanitize-and-parse-text.client";
import type { TranslationWithVote } from "../types";
import { VoteButtons } from "./VoteButtons";

interface TranslationItemProps {
	translation: TranslationWithVote;
	currentUserName: string | null;
	showAuthor?: boolean;
}

export function TranslationItem({
	translation,
	currentUserName,
	showAuthor = false,
}: TranslationItemProps) {
	return (
		<div className="p-2 rounded-xl border">
			<div className="mb-2">{sanitizeAndParseText(translation.text)}</div>
			{showAuthor && (
				<p className="text-sm text-gray-500 text-right">
					Translated by: {translation.displayName}
				</p>
			)}
			<VoteButtons
				translationWithVote={translation}
				currentUserName={currentUserName}
			/>
		</div>
	);
}

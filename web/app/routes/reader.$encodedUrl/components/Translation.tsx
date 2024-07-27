import DOMPurify from "dompurify";
import parse from "html-react-parser";
import { useMemo, useState } from "react";
import type { TranslationWithVote } from "../types";
import { AddAndVoteTranslations } from "./AddAndVoteTranslations";

interface TranslationProps {
	translationsWithVotes: TranslationWithVote[];
	userId: number | null;
	sourceTextId: number;
}

function getBestTranslation(
	translationsWithVotes: TranslationWithVote[],
): TranslationWithVote {
	const upvotedTranslations = translationsWithVotes.filter(
		(t) => t.userVote?.isUpvote,
	);
	if (upvotedTranslations.length > 0) {
		return upvotedTranslations.reduce((prev, current) => {
			const currentUpdatedAt = current.userVote?.updatedAt ?? new Date(0);
			const prevUpdatedAt = prev.userVote?.updatedAt ?? new Date(0);
			return currentUpdatedAt > prevUpdatedAt ? current : prev;
		});
	}
	return translationsWithVotes.reduce((prev, current) =>
		prev.point > current.point ? prev : current,
	);
}

export function Translation({
	translationsWithVotes,
	userId,
	sourceTextId,
}: TranslationProps) {
	const [isHovered, setIsHovered] = useState(false);

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
		const sanitized = DOMPurify.sanitize(
			bestTranslationWithVote.text.replace(/(\r\n|\n|\\n)/g, "<br />"),
		);
		return parse(sanitized);
	}, [bestTranslationWithVote.text]);

	return (
		<div
			className="relative group"
			onMouseEnter={() =>
				!isHovered && setTimeout(() => setIsHovered(true), 500)
			}
		>
			<div className="w-full notranslate mt-2 pt-2 text-lg font-medium ">
				{sanitizedAndParsedText}
			</div>
			<div className="absolute top-0 left-0 right-0 z-10 opacity-0 invisible border bg-white dark:bg-gray-900 rounded-xl shadow-xl dark:shadow-white/10 group-hover:opacity-100 group-hover:visible transition-all duration-500 ease-in-out">
				{isHovered && (
					<AddAndVoteTranslations
						bestTranslationWithVote={bestTranslationWithVote}
						alternativeTranslationsWithVotes={alternativeTranslationsWithVotes}
						userId={userId}
						sourceTextId={sourceTextId}
					/>
				)}
			</div>
		</div>
	);
}

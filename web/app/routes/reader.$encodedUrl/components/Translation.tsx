import DOMPurify from "dompurify";
import parse from "html-react-parser";
import { useMemo, useState,useCallback } from "react";
import type { TranslationWithVote } from "../types";
import { AlternativeTranslationsWithVotes } from "./AlternativeTranslationsWithVotes";

interface TranslationProps {
	translationsWithVotes: TranslationWithVote[];
	targetLanguage: string;
	userId: number | null;
	sourceTextId: number;
}

export function Translation({
	translationsWithVotes,
	targetLanguage,
	userId,
	sourceTextId,
}: TranslationProps) {
	const [isHoverCardVisible, setIsHoverCardVisible] = useState(false);
	const bestTranslationWithVote = useMemo(() => {
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
	}, [translationsWithVotes]);

	const alternativeTranslationsWithVotes = useMemo(
		() =>
			translationsWithVotes.filter((t) => t.id !== bestTranslationWithVote.id),
		[translationsWithVotes, bestTranslationWithVote],
	);

	const showHoverCard = useCallback(() => {
		const timer = setTimeout(() => setIsHoverCardVisible(true), 300);
		return () => clearTimeout(timer);
	}, []);

	const hideHoverCard = useCallback(() => setIsHoverCardVisible(false), []);

	const sanitizedAndParsedText = useMemo(() => {
		const sanitized = DOMPurify.sanitize(
			bestTranslationWithVote.text.replace(/(\r\n|\n|\\n)/g, "<br />")
		);
		return parse(sanitized);
	}, [bestTranslationWithVote.text]);

	return (
			<div
				className={`
					w-full notranslate mt-2 pt-2 border-t border-gray-200
					${isHoverCardVisible ? "shadow-xl -translate-y-1 bg-white  rounded-lg " : ""}
				`}
				onMouseEnter={showHoverCard}
				onMouseLeave={hideHoverCard}
			>
				<button
					type="button"
					lang={targetLanguage}
					className="w-full text-left"
					aria-expanded={isHoverCardVisible}
					aria-haspopup="true"
				>
					<div className="text-lg font-medium">
						{sanitizedAndParsedText}
					</div>
				</button>
				{isHoverCardVisible && (
					<AlternativeTranslationsWithVotes
						bestTranslationWithVote={bestTranslationWithVote}
						alternativeTranslationsWithVotes={alternativeTranslationsWithVotes}
						userId={userId}
						sourceTextId={sourceTextId}
					/>
				)}
			</div>
	);
}

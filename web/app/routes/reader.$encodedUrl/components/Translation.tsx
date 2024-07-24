import parse from "html-react-parser";
import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { useClickOutside } from "../functions/useClickOutside";
import type { TranslationWithVote } from "../types";
import { AddTranslationForm } from "./AddTranslationForm";
import { AlternativeTranslations } from "./AlternativeTranslations";
import { VoteButtons } from "./VoteButtons";

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
	const [isExpanded, setIsExpanded] = useState(false);
	const ref = useClickOutside(() => setIsExpanded(false));

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

	return (
		<div
			ref={ref}
			lang={targetLanguage}
			className="notranslate mt-2 pt-2 border-t border-gray-200 group relative"
		>
			<div className="text-lg font-medium ">
				{parse(
					bestTranslationWithVote.text.replace(/(\r\n|\n|\\n)/g, "<br />"),
				)}
			</div>
			<Button
				variant="outline"
				size="sm"
				className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
				onClick={(e) => {
					e.stopPropagation();
					setIsExpanded(!isExpanded);
				}}
			>
				{isExpanded ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
			</Button>
			{isExpanded && (
				<div className="">
					<VoteButtons
						translationWithVote={bestTranslationWithVote}
						userId={userId}
					/>
					<p className="text-sm text-gray-500 text-right">
						Translated by:{bestTranslationWithVote.userName}
					</p>
					<AlternativeTranslations
						translationsWithVotes={alternativeTranslationsWithVotes}
						userId={userId}
					/>
					{userId && <AddTranslationForm sourceTextId={sourceTextId} />}
				</div>
			)}
		</div>
	);
}

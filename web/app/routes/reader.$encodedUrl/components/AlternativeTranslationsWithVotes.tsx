import { VoteButtons } from "./VoteButtons";
import { AlternativeTranslations } from "./AlternativeTranslations";
import { AddTranslationForm } from "./AddTranslationForm";
import type { TranslationWithVote } from "../types";
import { useState, useMemo } from "react";
import { Button } from "~/components/ui/button";

const INITIAL_DISPLAY_COUNT = 3;

export function AlternativeTranslationsWithVotes({
	bestTranslationWithVote,
	alternativeTranslationsWithVotes,
	userId,
	sourceTextId,
}: {
	bestTranslationWithVote: TranslationWithVote;
	alternativeTranslationsWithVotes: TranslationWithVote[];
	userId: number | null;
	sourceTextId: number;
}) {
	const [showAll, setShowAll] = useState(false);

	const displayedTranslations = useMemo(() => {
		return showAll
			? alternativeTranslationsWithVotes
			: alternativeTranslationsWithVotes.slice(0, INITIAL_DISPLAY_COUNT);
	}, [alternativeTranslationsWithVotes, showAll]);

	const hasMoreTranslations = alternativeTranslationsWithVotes.length > INITIAL_DISPLAY_COUNT;

	return (
		<div className="p-4">
			<VoteButtons
				translationWithVote={bestTranslationWithVote}
				userId={userId}
			/>
			<p className="text-sm text-gray-500 text-right">
				Translated by: {bestTranslationWithVote.userName}
			</p>
			<div className="mt-4">
				<h4 className="text-sm text-right">Alternative Translations</h4>
				<AlternativeTranslations
					translationsWithVotes={displayedTranslations}
					userId={userId}
				/>
				{hasMoreTranslations && !showAll && (
					<Button
						variant="link"
						className="mt-2 w-full text-sm"
						onClick={() => setShowAll(true)}
					>
						Show more translations ({alternativeTranslationsWithVotes.length - INITIAL_DISPLAY_COUNT} more)
					</Button>
				)}
			</div>
			{userId && (
				<div className="mt-4">
					<h4 className="text-sm text-right">Add Your Translation</h4>
					<AddTranslationForm sourceTextId={sourceTextId} />
				</div>
			)}
		</div>
	);
}
import { ChevronDown, ListTree, PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import type { TranslationWithVote } from "../types";
import { AddTranslationForm } from "./AddTranslationForm";
import { AlternativeTranslations } from "./AlternativeTranslations";
import { TranslationItem } from "./TranslationItem";

const INITIAL_DISPLAY_COUNT = 3;

export function AddAndVoteTranslations({
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

	const hasMoreTranslations =
		alternativeTranslationsWithVotes.length > INITIAL_DISPLAY_COUNT;

	return (
		<div className="p-4 ">
			<TranslationItem
				translation={bestTranslationWithVote}
				userId={userId}
				showAuthor
			/>
			<div className="mt-4">
				<h4 className="text-sm flex items-center justify-end gap-2">
					<ListTree size={16} />
					Alternative Translations
				</h4>
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
						<ChevronDown size={16} className="mr-1" />
						Show more
					</Button>
				)}
			</div>
			{userId && (
				<div className="mt-4">
					<h4 className="text-sm flex items-center justify-end gap-2">
						<PlusCircle size={16} />
						Add Your Translation
					</h4>
					<AddTranslationForm sourceTextId={sourceTextId} />
				</div>
			)}
		</div>
	);
}

import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { AddTranslationForm } from "~/routes/resources+/add-translation-form";
import { TranslationListItem } from "~/routes/resources+/translation-list-item";
import type { TranslationWithVote } from "../../types";

const INITIAL_DISPLAY_COUNT = 3;

export function AddAndVoteTranslations({
	bestTranslationWithVote,
	alternativeTranslationsWithVotes,
	currentUserName,
	sourceTextId,
}: {
	bestTranslationWithVote: TranslationWithVote | null;
	alternativeTranslationsWithVotes: TranslationWithVote[];
	currentUserName: string | undefined;
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

	const toggleShowAll = () => setShowAll((prev) => !prev);

	return (
		<div className=" p-4">
			{bestTranslationWithVote && (
				<TranslationListItem
					translation={bestTranslationWithVote}
					currentUserName={currentUserName}
					showAuthor
				/>
			)}
			<div>
				<p className="text-gray-500 flex items-center justify-end mr-2 my-4">
					<ArrowUpDown size={16} />
				</p>
				{displayedTranslations.map((displayedTranslation) => (
					<TranslationListItem
						key={displayedTranslation.id}
						translation={displayedTranslation}
						currentUserName={currentUserName}
					/>
				))}
				{hasMoreTranslations && (
					<Button
						variant="link"
						className="mt-2 w-full text-sm"
						onClick={toggleShowAll}
					>
						{showAll ? (
							<>
								<ChevronUp size={16} className="mr-1" />
							</>
						) : (
							<>
								<ChevronDown size={16} className="mr-1" />
							</>
						)}
					</Button>
				)}
			</div>
			<div className="mt-2">
				<AddTranslationForm
					sourceTextId={sourceTextId}
					currentUserName={currentUserName}
				/>
			</div>
		</div>
	);
}

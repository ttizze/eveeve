import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { TranslationItem } from "~/routes/resources+/translation-item";
import type { TranslationWithVote } from "../types";
import { AddTranslationForm } from "./AddTranslationForm";
import { AlternativeTranslations } from "./AlternativeTranslations";

const INITIAL_DISPLAY_COUNT = 3;

export function AddAndVoteTranslations({
	bestTranslationWithVote,
	alternativeTranslationsWithVotes,
	currentUserName,
	sourceTextId,
}: {
	bestTranslationWithVote: TranslationWithVote;
	alternativeTranslationsWithVotes: TranslationWithVote[];
	currentUserName: string | null;
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
		<div className="p-4 ">
			<TranslationItem
				translation={bestTranslationWithVote}
				currentUserName={currentUserName}
				showAuthor
			/>
			<div className="mt-2">
				<p className="text-gray-500 flex items-center justify-end mr-2">
					<ArrowUpDown size={16} />
				</p>
				<AlternativeTranslations
					translationsWithVotes={displayedTranslations}
					currentUserName={currentUserName}
				/>
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

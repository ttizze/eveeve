import type { UseFloatingReturn } from "@floating-ui/react";
import { ChevronDown, ChevronUp, Languages } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { AddTranslationForm } from "~/routes/resources+/add-translation-form";
import { TranslationListItem } from "~/routes/resources+/translation-list-item";
import type { SourceTextWithTranslations } from "../../types";

const INITIAL_DISPLAY_COUNT = 3;

export function AddAndVoteTranslations({
	currentUserName,
	sourceTextWithTranslations,
	open,
}: {
	currentUserName: string | undefined;
	sourceTextWithTranslations: SourceTextWithTranslations;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	floatingRefs: UseFloatingReturn["refs"];
	floatingStyles: UseFloatingReturn["floatingStyles"];
}) {
	const [showAll, setShowAll] = useState(false);
	const { bestTranslationWithVote, translationsWithVotes, sourceText } =
		sourceTextWithTranslations;
	const alternativeTranslationsWithVotes = translationsWithVotes.filter(
		(t) => t.translateText.id !== bestTranslationWithVote?.translateText.id,
	);

	const displayedTranslations = useMemo(() => {
		return showAll
			? alternativeTranslationsWithVotes
			: alternativeTranslationsWithVotes.slice(0, INITIAL_DISPLAY_COUNT);
	}, [alternativeTranslationsWithVotes, showAll]);

	const hasMoreTranslations =
		alternativeTranslationsWithVotes.length > INITIAL_DISPLAY_COUNT;

	const toggleShowAll = () => setShowAll((prev) => !prev);

	if (!open) return null;

	return (
		<div className="w-full bg-background border rounded-lg p-4">
			<div className="flex items-center gap-2 mb-4">
				<Languages className="text-gray-500 w-4 h-4" />
				<p className="text-xl">{sourceText.text}</p>
			</div>
			<div>
				{bestTranslationWithVote && (
					<TranslationListItem
						translation={bestTranslationWithVote}
						currentUserName={currentUserName}
					/>
				)}
				<div>
					{displayedTranslations.map((displayedTranslation) => (
						<TranslationListItem
							key={displayedTranslation.translateText.id}
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
				<div className="mt-4">
					<AddTranslationForm
						sourceTextId={sourceTextWithTranslations.sourceText.id}
						currentUserName={currentUserName}
					/>
				</div>
			</div>
		</div>
	);
}

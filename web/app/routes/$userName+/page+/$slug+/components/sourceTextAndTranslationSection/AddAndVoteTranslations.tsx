import type { UseFloatingReturn } from "@floating-ui/react";
import { ArrowUpDown, ChevronDown, ChevronUp, Languages } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { AddTranslationForm } from "~/routes/resources+/add-translation-form";
import { TranslationListItem } from "~/routes/resources+/translation-list-item";
import type { SourceTextWithTranslations } from "../../types";

const INITIAL_DISPLAY_COUNT = 3;

export function AddAndVoteTranslations({
	currentUserName,
	sourceTextWithTranslations,
	open,
	onOpenChange,
	floatingRefs,
	floatingStyles,
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

	return (
		<Dialog open={open} onOpenChange={onOpenChange} modal={false}>
			<DialogContent
				className="w-full  max-h-[90vh]  overflow-y-auto flex flex-col"
				ref={floatingRefs.setFloating}
				style={{
					...floatingStyles,
					animation: "none",
					transition: "none",
				}}
			>
				<DialogHeader>
					<DialogTitle>
						<Languages className="text-gray-500 w-4 h-4" />
					</DialogTitle>
				</DialogHeader>
				<p className="text-xl pl-2">{sourceText.text}</p>
				<div className="mt-4">
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
			</DialogContent>
		</Dialog>
	);
}

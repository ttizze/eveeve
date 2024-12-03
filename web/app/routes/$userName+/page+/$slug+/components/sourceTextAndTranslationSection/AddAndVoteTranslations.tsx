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
				className="relative p-4 bg-background border-2 border-gray-500 rounded-lg !max-w-2xl
											before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-y-[11px] before:-translate-x-[10px] before:w-[20px] before:h-[10px]
											before:bg-gray-500 before:[clip-path:polygon(50%_0,100%_100%,0_100%)]
											after:content-[''] after:absolute after:top-0 after:left-1/2 after:-translate-y-[8px] after:-translate-x-[10px] after:w-[20px] after:h-[10px]
											after:bg-background after:[clip-path:polygon(50%_0,100%_100%,0_100%)]"
				ref={floatingRefs.setFloating}
				style={{
					...floatingStyles,
					animation: "none",
					transition: "none",
				}}
			>
				<DialogHeader>
					<DialogTitle className="flex items-center text-gray-500">
						<Languages className=" w-4 h-4 mr-1" /> Other translations:
					</DialogTitle>
				</DialogHeader>
				<div className="">
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
					<div className="">
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

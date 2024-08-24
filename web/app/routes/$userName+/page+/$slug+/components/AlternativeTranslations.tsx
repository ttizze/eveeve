import { TranslationItem } from "~/routes/resources+/translation-item";
import type { TranslationWithVote } from "../types";

interface AlternativeTranslationsProps {
	translationsWithVotes: TranslationWithVote[];
	currentUserName: string | null;
}

export function AlternativeTranslations({
	translationsWithVotes,
	currentUserName,
}: AlternativeTranslationsProps) {
	if (translationsWithVotes.length === 0) return null;

	return (
		<div className="space-y-3">
			{translationsWithVotes.map((translation) => (
				<TranslationItem
					key={translation.id}
					translation={translation}
					currentUserName={currentUserName}
				/>
			))}
		</div>
	);
}

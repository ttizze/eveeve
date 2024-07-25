import type { TranslationWithVote } from "../types";
import { VoteButtons } from "./VoteButtons";
import DOMPurify from "dompurify";
import parse from "html-react-parser";
interface AlternativeTranslationsProps {
	translationsWithVotes: TranslationWithVote[];
	userId: number | null;
}

export function AlternativeTranslations({
	translationsWithVotes,
	userId,
}: AlternativeTranslationsProps) {
	if (translationsWithVotes.length === 0) return null;

	return (
		<div className="rounded-md">
			<div className="space-y-3">
				{translationsWithVotes.map((translationWithVote) => (
					<div
						key={translationWithVote.id}
						className="p-2 rounded border border-gray-200"
					>
						<div className="text-sm mb-2">
							{parse(
								DOMPurify.sanitize(
									translationWithVote.text
										.replace(/(\r\n|\n|\\n)/g, "<br />"),
								),
							)}
						</div>
						<VoteButtons
							translationWithVote={translationWithVote}
							userId={userId}
						/>
					</div>
				))}
			</div>
		</div>
	);
}

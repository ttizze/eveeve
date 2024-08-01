import type { TranslationWithVote } from "../types";

export function getBestTranslation(
	translationsWithVotes: TranslationWithVote[],
): TranslationWithVote {
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
}

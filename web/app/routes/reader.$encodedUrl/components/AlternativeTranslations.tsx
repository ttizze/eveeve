import type { TranslationWithVote } from "../types";
import { VoteButtons } from "./VoteButtons";

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
      <p className="font-semibold text-gray-600 mb-2">Other translations:</p>
      <div className="space-y-3">
        {translationsWithVotes.map((translationWithVote) => (
          <div key={translationWithVote.id} className="p-2 rounded border border-gray-200">
            <div className="text-sm mb-2">{translationWithVote.text}</div>
            <VoteButtons translationWithVote={translationWithVote} userId={userId} />
          </div>
        ))}
      </div>
    </div>
  );
}
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { TranslationData } from "../types";

interface VoteButtonsProps {
	translation: TranslationData;
	onVote: (isUpvote: boolean) => void;
	userId: number | null;
}

export function VoteButtons({ translation, onVote, userId }: VoteButtonsProps) {
	const userVoteStatus = translation.userVote
		? translation.userVote.isUpvote
			? "upvoted"
			: "downvoted"
		: "not_voted";

	return (
		<div className="flex justify-end items-center mt-2">
			<div className="space-x-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onVote(true)}
					disabled={!userId}
				>
					<ThumbsUp
						className={`mr-2 h-4 w-4 ${userVoteStatus === "upvoted" ? "text-blue-500" : ""}`}
					/>
					{translation.point}
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onVote(false)}
					disabled={!userId}
				>
					<ThumbsDown
						className={`mr-2 h-4 w-4 ${userVoteStatus === "downvoted" ? "text-red-500" : ""}`}
					/>
				</Button>
			</div>
		</div>
	);
}

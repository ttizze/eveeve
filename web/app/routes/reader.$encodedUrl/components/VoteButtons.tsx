import { useFetcher } from "@remix-run/react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { TranslationWithVote } from "../types";

interface VoteButtonsProps {
	translationWithVote: TranslationWithVote;
	userId: number | null;
}

export function VoteButtons({ translationWithVote, userId }: VoteButtonsProps) {
	const fetcher = useFetcher();
	const isVoting = fetcher.state !== "idle";

	return (
		<div className="flex justify-end items-center mt-2">
			<fetcher.Form method="post" className="space-x-2 flex">
				<input type="hidden" name="intent" value="vote" />
				<input type="hidden" name="translateTextId" value={translationWithVote.id.toString()} />
				<Button
					variant="outline"
					size="sm"
					type="submit"
					name="isUpvote"
					value="true"
					disabled={!userId || isVoting}
				>
					<ThumbsUp
						className={`mr-2 h-4 w-4 ${translationWithVote.userVote?.isUpvote === true ? "text-blue-500" : ""}`}
					/>
					{translationWithVote.point}
				</Button>
				<Button
					variant="outline"
					size="sm"
					type="submit"
					name="isUpvote"
					value="false"
					disabled={!userId || isVoting}
				>
					<ThumbsDown
						className={`mr-2 h-4 w-4 ${translationWithVote.userVote?.isUpvote === false ? "text-red-500" : ""}`}
					/>
				</Button>
			</fetcher.Form>
		</div>
	);
}

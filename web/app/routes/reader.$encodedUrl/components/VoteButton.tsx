import { ThumbsDown, ThumbsUp } from "lucide-react";
import { memo } from "react";
import { Button } from "~/components/ui/button";

export const VoteButton = memo(function VoteButton({
	isUpvote,
	isDisabled,
	point,
	iconClass,
}: {
	isUpvote: boolean;
	isDisabled: boolean;
	point?: number;
	iconClass: string;
}) {
	const Icon = isUpvote ? ThumbsUp : ThumbsDown;
	return (
		<Button
			variant="outline"
			size="sm"
			type="submit"
			name="isUpvote"
			value={isUpvote.toString()}
			disabled={isDisabled}
		>
			<Icon className={iconClass} />
			{isUpvote && point}
		</Button>
	);
});

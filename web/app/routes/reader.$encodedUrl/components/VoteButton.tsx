import { ThumbsDown, ThumbsUp } from "lucide-react";
import { memo } from "react";
import { useEffect, useRef } from "react";
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
	const renderCount = useRef(0);
	const totalRenderTime = useRef({ total: 0, count: 0 });

	useEffect(() => {
		renderCount.current += 1;
		const startTime = performance.now();

		return () => {
			const endTime = performance.now();
			const renderTime = endTime - startTime;
			totalRenderTime.current.total += renderTime;
			totalRenderTime.current.count += 1;

			console.log(`
        VoteButton ${isUpvote ? "Up" : "Down"} Performance Log (Render #${renderCount.current}):
        Render Time: ${renderTime.toFixed(2)}ms
        Average Render Time: ${(totalRenderTime.current.total / totalRenderTime.current.count).toFixed(2)}ms
      `);
		};
	});

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

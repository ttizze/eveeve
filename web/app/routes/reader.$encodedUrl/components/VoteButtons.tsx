import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useFetcher } from "@remix-run/react";
import { memo, useMemo } from "react";
import { useState } from "react";
import { LoginDialog } from "~/routes/resources+/LoginDialog";
import { cn } from "~/utils/cn";
import type { TranslationWithVote } from "../types";
import { voteSchema } from "../types";
import { VoteButton } from "./VoteButton";

interface VoteButtonsProps {
	translationWithVote: TranslationWithVote;
	userId: number | null;
}

export const VoteButtons = memo(function VoteButtons({
	translationWithVote,
	userId,
}: VoteButtonsProps) {
	const fetcher = useFetcher();
	const [showLoginDialog, setShowLoginDialog] = useState(false);
	const [form, fields] = useForm({
		id: `vote-form-${translationWithVote.id}`,
		onValidate: useMemo(
			() =>
				({ formData }: { formData: FormData }) => {
					return parseWithZod(formData, { schema: voteSchema });
				},
			[],
		),
	});
	const isVoting = fetcher.state !== "idle";

	const buttonClasses = useMemo(
		() => ({
			upVote: cn(
				"mr-2 h-4 w-4",
				translationWithVote.userVote?.isUpvote === true && "text-blue-500",
			),
			downVote: cn(
				"mr-2 h-4 w-4",
				translationWithVote.userVote?.isUpvote === false && "text-red-500",
			),
		}),
		[translationWithVote.userVote?.isUpvote],
	);
	const handleVoteClick = (e: React.MouseEvent) => {
		if (!userId) {
			setShowLoginDialog(true);
			e.preventDefault();
		}
	};

	return (
		<div className="flex justify-end items-center mt-2">
			<fetcher.Form
				method="post"
				{...getFormProps(form)}
				className="space-x-2 flex"
			>
				<input
					value="vote"
					{...getInputProps(fields.intent, { type: "hidden" })}
				/>
				<input
					value={translationWithVote.id.toString()}
					{...getInputProps(fields.translateTextId, { type: "hidden" })}
				/>
				<VoteButton
					isUpvote={true}
					isDisabled={isVoting}
					point={translationWithVote.point}
					iconClass={buttonClasses.upVote}
					onClick={handleVoteClick}
				/>
				<VoteButton
					isUpvote={false}
					isDisabled={isVoting}
					iconClass={buttonClasses.downVote}
					onClick={handleVoteClick}
				/>
			</fetcher.Form>
			<LoginDialog isOpen={showLoginDialog} onOpenChange={setShowLoginDialog} />
		</div>
	);
});

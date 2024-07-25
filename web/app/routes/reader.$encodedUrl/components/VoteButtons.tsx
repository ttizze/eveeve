import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useFetcher } from "@remix-run/react";
import { memo, useEffect, useMemo, useRef } from "react";
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
					isDisabled={!userId || isVoting}
					point={translationWithVote.point}
					iconClass={buttonClasses.upVote}
				/>
				<VoteButton
					isUpvote={false}
					isDisabled={!userId || isVoting}
					iconClass={buttonClasses.downVote}
				/>
			</fetcher.Form>
		</div>
	);
});

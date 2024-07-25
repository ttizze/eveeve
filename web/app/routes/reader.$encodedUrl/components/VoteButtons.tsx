import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useFetcher } from "@remix-run/react";
import type { TranslationWithVote } from "../types";
import { voteSchema } from "../types";
import { cn } from "~/utils/cn";
import { useMemo } from "react";
import { VoteButton } from "./VoteButton";

interface VoteButtonsProps {
	translationWithVote: TranslationWithVote;
	userId: number | null;
}
export function VoteButtons({ translationWithVote, userId }: VoteButtonsProps) {
	const fetcher = useFetcher();
	const [form, fields] = useForm({
		id: `vote-form-${translationWithVote.id}`,
		onValidate: useMemo(() => ({ formData }: { formData: FormData }) => {
			return parseWithZod(formData, { schema: voteSchema });
		}, []),
	});
	const isVoting = fetcher.state !== "idle";

	const upVoteButtonClass = cn(
		"mr-2 h-4 w-4",
		translationWithVote.userVote?.isUpvote === true && "text-blue-500"
	);

	const downVoteButtonClass = cn(
		"mr-2 h-4 w-4",
		translationWithVote.userVote?.isUpvote === false && "text-red-500"
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
					iconClass={upVoteButtonClass}
				/>
				<VoteButton
					isUpvote={false}
					isDisabled={!userId || isVoting}
					iconClass={downVoteButtonClass}
				/>
			</fetcher.Form>
		</div>
	);
}

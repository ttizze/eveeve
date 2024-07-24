import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useFetcher } from "@remix-run/react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { TranslationWithVote } from "../types";
import { voteSchema } from "../types";

interface VoteButtonsProps {
	translationWithVote: TranslationWithVote;
	userId: number | null;
}
export function VoteButtons({ translationWithVote, userId }: VoteButtonsProps) {
	const fetcher = useFetcher();
	const [form, fields] = useForm({
		id: `vote-form-${translationWithVote.id}`,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: voteSchema });
		},
	});
	const isVoting = fetcher.state !== "idle";

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

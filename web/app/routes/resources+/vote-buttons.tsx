import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { memo, useMemo } from "react";
import { useState } from "react";
import { z } from "zod";
import { LoginDialog } from "~/components/LoginDialog";
import { VoteButton } from "~/routes/$userName+/page+/$slug+/components/sourceTextAndTranslationSection/VoteButton";
import type { TranslationWithVote } from "~/routes/$userName+/page+/$slug+/types";
import { authenticator } from "~/utils/auth.server";
import { cn } from "~/utils/cn";
import { handleVote } from "./functions/mutations.server";

export const schema = z.object({
	translateTextId: z.number(),
	isUpvote: z.preprocess((val) => val === "true", z.boolean()),
});

export async function action({ request }: ActionFunctionArgs) {
	const currentUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/auth/login",
	});
	const submission = parseWithZod(await request.formData(), {
		schema,
	});
	if (submission.status !== "success") {
		return { lastResult: submission.reply() };
	}
	await handleVote(
		submission.value.translateTextId,
		submission.value.isUpvote,
		currentUser.id,
	);
	return {
		lastResult: submission.reply({ resetForm: true }),
	};
}

interface VoteButtonsProps {
	translationWithVote: TranslationWithVote;
	currentUserName: string | undefined;
}

export const VoteButtons = memo(function VoteButtons({
	translationWithVote,
	currentUserName,
}: VoteButtonsProps) {
	const fetcher = useFetcher();
	const [showLoginDialog, setShowLoginDialog] = useState(false);
	const [form, fields] = useForm({
		id: `vote-form-${translationWithVote.translateText.id}`,
		onValidate: useMemo(
			() =>
				({ formData }: { formData: FormData }) => {
					return parseWithZod(formData, { schema });
				},
			[],
		),
	});
	const isVoting = fetcher.state !== "idle";

	const buttonClasses = useMemo(
		() => ({
			upVote: cn(
				"mr-2 h-4 w-4",
				translationWithVote.vote?.isUpvote === true && "text-blue-500",
			),
			downVote: cn(
				"mr-2 h-4 w-4",
				translationWithVote.vote?.isUpvote === false && "text-red-500",
			),
		}),
		[translationWithVote.vote?.isUpvote],
	);
	const handleVoteClick = (e: React.MouseEvent) => {
		if (!currentUserName) {
			setShowLoginDialog(true);
			e.preventDefault();
		}
	};

	return (
		<div className="flex justify-end items-center mt-2">
			<fetcher.Form
				method="post"
				{...getFormProps(form)}
				action="/resources/vote-buttons"
				className="space-x-2 flex"
			>
				<input
					value={translationWithVote.translateText.id.toString()}
					{...getInputProps(fields.translateTextId, { type: "hidden" })}
				/>
				<VoteButton
					isUpvote={true}
					isDisabled={isVoting}
					point={translationWithVote.translateText.point}
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

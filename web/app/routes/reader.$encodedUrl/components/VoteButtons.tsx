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
	const renderCount = useRef(0);
	const performanceLog = useRef({
		useForm: { total: 0, count: 0 },
		classNameGeneration: { total: 0, count: 0 },
		totalRenderTime: { total: 0, count: 0 },
	});

	useEffect(() => {
		renderCount.current += 1;
		const startTime = performance.now();

		return () => {
			const endTime = performance.now();
			const renderTime = endTime - startTime;
			performanceLog.current.totalRenderTime.total += renderTime;
			performanceLog.current.totalRenderTime.count += 1;

			console.log(`
        VoteButtons Performance Log (Render #${renderCount.current}):
        Total Render Time: ${renderTime.toFixed(2)}ms
        Average Render Time: ${(performanceLog.current.totalRenderTime.total / performanceLog.current.totalRenderTime.count).toFixed(2)}ms
        useForm:
          - Average: ${(performanceLog.current.useForm.total / performanceLog.current.useForm.count).toFixed(2)}ms
          - Total: ${performanceLog.current.useForm.total.toFixed(2)}ms
          - Count: ${performanceLog.current.useForm.count}
        Class Name Generation:
          - Average: ${(performanceLog.current.classNameGeneration.total / performanceLog.current.classNameGeneration.count).toFixed(2)}ms
          - Total: ${performanceLog.current.classNameGeneration.total.toFixed(2)}ms
          - Count: ${performanceLog.current.classNameGeneration.count}
      `);
		};
	});

	const fetcher = useFetcher();
	const useFormStartTime = performance.now();
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
	const useFormEndTime = performance.now();
	performanceLog.current.useForm.total += useFormEndTime - useFormStartTime;
	performanceLog.current.useForm.count += 1;

	const isVoting = fetcher.state !== "idle";

	const classNameStartTime = performance.now();

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
	const classNameEndTime = performance.now();
	performanceLog.current.classNameGeneration.total +=
		classNameEndTime - classNameStartTime;
	performanceLog.current.classNameGeneration.count += 1;

	const isDisabled = !userId || isVoting;

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

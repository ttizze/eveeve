import type { UserAITranslationInfo } from "@prisma/client";
import { useRevalidator } from "@remix-run/react";
import { useEffect } from "react";
import { Progress } from "~/components/ui/progress";
import { cn } from "~/utils/cn";

type UserAITranslationStatusProps = {
	userAITranslationInfo: UserAITranslationInfo | null;
};

export function UserAITranslationStatus({
	userAITranslationInfo,
}: UserAITranslationStatusProps) {
	const revalidator = useRevalidator();
	useEffect(() => {
		const intervalId = setInterval(() => {
			revalidator.revalidate();
		}, 5000);

		return () => clearInterval(intervalId);
	}, [revalidator]);

	if (!userAITranslationInfo) {
		return null;
	}

	const statusText =
		{
			in_progress: "in_progress",
			failed: "failed",
			completed: "completed",
		}[userAITranslationInfo.aiTranslationStatus] || "";

	return (
		<div className="mt-3 space-y-1">
			<Progress
				value={userAITranslationInfo.aiTranslationProgress}
				className={cn(
					userAITranslationInfo.aiTranslationStatus === "in_progress" &&
						"bg-blue-400 animate-pulse",
					userAITranslationInfo.aiTranslationStatus === "failed" &&
						"bg-red-400",
				)}
			/>
			<div className="flex justify-between text-sm">
				<span>{statusText}</span>
				<span>{Math.round(userAITranslationInfo.aiTranslationProgress)}%</span>
			</div>
		</div>
	);
}

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
		}, 3000);

		return () => clearInterval(intervalId);
	}, [revalidator]);

	return (
		<div className="h-[20px] flex mt-1 items-center space-y-1">
			{userAITranslationInfo ? (
				<>
					<Progress
						value={userAITranslationInfo.aiTranslationProgress}
						className={cn(
							"flex-grow",
							userAITranslationInfo.aiTranslationStatus === "in_progress" &&
								"bg-blue-400 animate-pulse",
							userAITranslationInfo.aiTranslationStatus === "failed" &&
								"bg-red-400",
						)}
					/>
					<span className="mx-2 !my-0">
						{Math.round(userAITranslationInfo.aiTranslationProgress)}%
					</span>
					<span className="!my-0">
						{userAITranslationInfo.aiTranslationStatus}
					</span>
				</>
			) : null}
		</div>
	);
}

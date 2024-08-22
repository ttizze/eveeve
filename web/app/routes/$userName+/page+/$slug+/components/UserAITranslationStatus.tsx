import type { UserAITranslationInfo } from "@prisma/client";
import { useRevalidator } from "@remix-run/react";
import { useEffect } from "react";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { cn } from "~/utils/cn";

type UserAITranslationStatusProps = {
	userAITranslationInfo: UserAITranslationInfo[] | null;
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

	if (!userAITranslationInfo || userAITranslationInfo.length === 0) {
		return null;
	}

	const latestTranslation = userAITranslationInfo[0]; // 最新の翻訳情報を使用

	return (
		<div className="mt-3 space-y-2">
			<Progress
				value={latestTranslation.aiTranslationProgress}
				className={cn(
					latestTranslation.aiTranslationStatus === "in_progress" &&
						"bg-blue-400 animate-pulse",
				)}
			/>
			<div className="flex justify-end items-center">
				<Badge
					variant={getVariantForStatus(latestTranslation.aiTranslationStatus)}
				>
					{latestTranslation.aiTranslationStatus}
				</Badge>
			</div>
		</div>
	);
}

function getVariantForStatus(
	status: string,
): "default" | "secondary" | "destructive" | "outline" {
	switch (status) {
		case "completed":
			return "default";
		case "in_progress":
			return "secondary";
		case "failed":
			return "destructive";
		default:
			return "outline";
	}
}

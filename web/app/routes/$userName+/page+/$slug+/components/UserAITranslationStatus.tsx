import type { UserAITranslationInfo } from "@prisma/client";
import { useRevalidator } from "@remix-run/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/utils/cn";

type UserAITranslationStatusProps = {
	userAITranslationInfo: UserAITranslationInfo[] | null;
};

export function UserAITranslationStatus({
	userAITranslationInfo,
}: UserAITranslationStatusProps) {
	const [isOpen, setIsOpen] = useState(false);

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

	return (
		<Card className="mt-3">
			<CardHeader className="flex flex-row items-center justify-between">
				<Button
					variant="ghost"
					className="w-full justify-between"
					onClick={() => setIsOpen(!isOpen)}
					aria-label={
						isOpen ? "Close translation status" : "Open translation status"
					}
				>
					<CardTitle className="text-sm">Your AI Translation Status</CardTitle>
					{isOpen ? (
						<ChevronUp className="h-4 w-4" />
					) : (
						<ChevronDown className="h-4 w-4" />
					)}
				</Button>
			</CardHeader>
			{isOpen && (
				<CardContent>
					<ScrollArea className="h-[300px]">
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
							{userAITranslationInfo.map((item) => (
								<Card key={item.id} className="flex flex-col h-full">
									<CardHeader>
										<CardTitle className="text-sm truncate flex flex-col h-10">
											<Badge
												className="mt-2 w-full flex justify-center"
												variant={getVariantForStatus(item.aiTranslationStatus)}
											>
												{item.aiTranslationStatus}
											</Badge>
										</CardTitle>
									</CardHeader>
									<CardContent className="flex-grow flex flex-col">
										<Progress
											value={item.aiTranslationProgress}
											className={cn(
												"mt-2",
												item.aiTranslationStatus === "in_progress" &&
													"bg-blue-400 animate-pulse",
											)}
										/>
										<p className="text-xs mt-2">{item.aiModel}</p>
										<p className="text-xs mt-2">
											{new Date(item.createdAt).toLocaleString()}
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					</ScrollArea>
				</CardContent>
			)}
		</Card>
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

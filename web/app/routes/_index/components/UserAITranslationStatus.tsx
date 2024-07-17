import { Link } from "@remix-run/react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { UserAITranslationInfoItem } from "../../translate/types";

type UserAITranslationStatusProps = {
	userAITranslationInfo: UserAITranslationInfoItem[];
	targetLanguage: string;
};

export function UserAITranslationStatus({
	userAITranslationInfo = [],
	targetLanguage,
}: UserAITranslationStatusProps) {
	if (!userAITranslationInfo || userAITranslationInfo.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Translation Status ({targetLanguage})</CardTitle>
				</CardHeader>
				<CardContent>
					<p>No translation history available.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Translation Status ({targetLanguage})</CardTitle>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-[300px]">
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
						{userAITranslationInfo.map((item) => {
							const translationInfo =
								item.pageVersion.pageVersionTranslationInfo?.[0];
							return (
								<Link
									key={item.id}
									to={`/reader/${encodeURIComponent(item.pageVersion.page.url)}`}
									className="no-underline text-inherit"
								>
									<Card className="flex flex-col hover:shadow-md transition-shadow duration-200">
										<CardHeader>
											<CardTitle className="text-sm truncate flex flex-col">
												{item.pageVersion.title}
												{translationInfo?.translationTitle && (
													<span className="text-xs text-muted-foreground">
														{translationInfo.translationTitle}
													</span>
												)}
											</CardTitle>
										</CardHeader>
										<CardContent className="flex-grow">
											<p className="text-xs text-muted-foreground truncate">
												{item.pageVersion.page.url}
											</p>
											<Badge
												className="mt-2"
												variant={getVariantForStatus(item.aiTranslationStatus)}
											>
												{item.aiTranslationStatus}
											</Badge>
											<Progress
												value={item.aiTranslationProgress}
												className="mt-2"
											/>
											<p className="text-xs mt-2">
												Last updated:{" "}
												{new Date(item.lastTranslatedAt).toLocaleString()}
											</p>
										</CardContent>
									</Card>
								</Link>
							);
						})}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}

function getVariantForStatus(
	status: string,
): "default" | "secondary" | "destructive" | "outline" {
	switch (status) {
		case "completed":
			return "default";
		case "processing":
			return "secondary";
		case "failed":
			return "destructive";
		default:
			return "outline";
	}
}

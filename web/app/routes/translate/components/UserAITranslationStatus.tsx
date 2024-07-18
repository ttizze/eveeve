import { Link } from "@remix-run/react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { UserAITranslationInfoItem } from "../types";
import { Button } from "~/components/ui/button";
import { Form } from "@remix-run/react";
import { useNavigation } from "@remix-run/react";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { RotateCcw } from 'lucide-react';
import { urlTranslationSchema } from "../types";
import { useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";

type UserAITranslationStatusProps = {
	userAITranslationInfo: UserAITranslationInfoItem[];
	targetLanguage: string;
};

export function UserAITranslationStatus({
	userAITranslationInfo = [],
	targetLanguage,
}: UserAITranslationStatusProps) {

	const navigation = useNavigation();
	const [form, fields] = useForm({
		id: "url-re-translation-form",
		constraint: getZodConstraint(urlTranslationSchema),
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: urlTranslationSchema });
		},
	});
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
							const translationInfo = item.pageVersion.pageVersionTranslationInfo?.[0];
							return (
								<Card key={item.id} className="flex flex-col hover:shadow-md transition-shadow duration-200">
									<CardHeader>
										<CardTitle className="text-sm truncate flex flex-col h-10">
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
											{new Date(item.lastTranslatedAt).toLocaleString()}
										</p>
										<div className="mt-2  justify-between items-center">
											<Link
												to={`/reader/${encodeURIComponent(item.pageVersion.page.url)}`}
												className="text-xs text-blue-500 hover:underline"
											>
												View
											</Link>
											<Form method="post">
												<input type="hidden" name="url" value={item.pageVersion.page.url} />
												<Button
													type="submit"
													name="intent"
													value="translateUrl"
													disabled={navigation.state === "submitting"}
												>
													{navigation.state === "submitting" ? (
														<LoadingSpinner />
													) : (
														<RotateCcw className="w-4 h-4" />
													)}
												</Button>
											</Form>
										</div>
									</CardContent>
								</Card>
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

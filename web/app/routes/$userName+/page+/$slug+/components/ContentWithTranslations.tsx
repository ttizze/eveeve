import type { UserAITranslationInfo } from "@prisma/client";
import { Link } from "@remix-run/react";
import { Loader2, SquarePen } from "lucide-react";
import { memo } from "react";
import { useHydrated } from "remix-utils/use-hydrated";
import { Button } from "~/components/ui/button";
import type {
	PageWithTranslations,
	SourceTextWithTranslations,
} from "../types";
import { ParsedContent } from "./ParsedContent";
import { SourceTextAndTranslationSection } from "./sourceTextAndTranslationSection/SourceTextAndTranslationSection";
import { TranslateButton } from "./translateButton/TranslateButton";

interface ContentWithTranslationsProps {
	pageWithTranslations: PageWithTranslations;
	sourceTitleWithTranslations: SourceTextWithTranslations | null;
	currentUserName: string | undefined;
	hasGeminiApiKey: boolean;
	userAITranslationInfo: UserAITranslationInfo | null;
	targetLanguage: string;
}

export const ContentWithTranslations = memo(function ContentWithTranslations({
	pageWithTranslations,
	sourceTitleWithTranslations,
	currentUserName,
	hasGeminiApiKey,
	userAITranslationInfo,
	targetLanguage,
}: ContentWithTranslationsProps) {
	const isHydrated = useHydrated();
	const localCreatedAt = isHydrated
		? pageWithTranslations.createdAt.toLocaleString()
		: pageWithTranslations.createdAt.toISOString();

	return (
		<>
			<h1 className="!mb-5">
				{sourceTitleWithTranslations && (
					<SourceTextAndTranslationSection
						sourceTextWithTranslation={sourceTitleWithTranslations}
						isPublished={pageWithTranslations.isPublished}
						currentUserName={currentUserName}
						sourceLanguage={pageWithTranslations.sourceLanguage}
						targetLanguage={targetLanguage}
					/>
				)}
			</h1>
			<TranslateButton
				pageId={pageWithTranslations.id}
				userAITranslationInfo={userAITranslationInfo}
				hasGeminiApiKey={hasGeminiApiKey}
				targetLanguage={targetLanguage}
			/>
			<div className="flex items-center">
				<Link
					to={`/${pageWithTranslations.user.userName}`}
					className=" flex items-center mr-2 !no-underline hover:text-gray-700"
				>
					<img
						src={pageWithTranslations.user.icon}
						alt="Icon"
						className="w-14 h-14 rounded-full object-cover mx-3 !my-0"
					/>
					<div className="flex flex-col">
						<span className="text-sm">
							{pageWithTranslations.user.displayName}
						</span>
						<span className="text-xs text-gray-500">{localCreatedAt}</span>
					</div>
				</Link>
				{pageWithTranslations.user.userName === currentUserName &&
					currentUserName && (
						<div className="ml-auto">
							<Button asChild variant="ghost">
								<Link
									to={`/${currentUserName}/page/${pageWithTranslations.slug}/edit`}
								>
									<SquarePen className="w-5 h-5" />
								</Link>
							</Button>
						</div>
					)}
			</div>
			{!isHydrated ? (
				<div className="w-full h-full flex items-center justify-center">
					<Loader2 className="w-10 h-10 animate-spin" />
				</div>
			) : (
				<ParsedContent
					pageWithTranslations={pageWithTranslations}
					sourceLanguage={pageWithTranslations.sourceLanguage}
					targetLanguage={targetLanguage}
					currentUserName={currentUserName}
				/>
			)}
		</>
	);
});

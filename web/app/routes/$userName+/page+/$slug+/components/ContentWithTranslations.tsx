import type { UserAITranslationInfo } from "@prisma/client";
import { Link } from "@remix-run/react";
import DOMPurify from "dompurify";
import parse from "html-react-parser";
import { Loader2, Lock, SquarePen } from "lucide-react";
import { memo, useMemo } from "react";
import { useHydrated } from "remix-utils/use-hydrated";
import { Button } from "~/components/ui/button";
import type { PageWithTranslations } from "../types";
import { TranslateButton } from "./TranslateButton";
import { TranslationSection } from "./TranslationSection";

interface ContentWithTranslationsProps {
	pageWithTranslations: PageWithTranslations;
	currentUserName: string | null;
	hasGeminiApiKey: boolean;
	userAITranslationInfo: UserAITranslationInfo | null;
	targetLanguage: string;
}

export const ContentWithTranslations = memo(function ContentWithTranslations({
	pageWithTranslations,
	currentUserName,
	hasGeminiApiKey,
	userAITranslationInfo,
	targetLanguage,
}: ContentWithTranslationsProps) {
	const isHydrated = useHydrated();
	const localCreatedAt = isHydrated
		? pageWithTranslations.createdAt.toLocaleString()
		: pageWithTranslations.createdAt.toISOString();
	const bestTranslationTitle = useMemo(() => {
		const sourceTextWithTranslations =
			pageWithTranslations.sourceTextWithTranslations.find(
				(sourceTextWithTranslation) =>
					sourceTextWithTranslation.sourceText.number === 0,
			);
		if (
			sourceTextWithTranslations &&
			sourceTextWithTranslations?.translationsWithVotes.length > 0
		) {
			return sourceTextWithTranslations;
		}
		return null;
	}, [pageWithTranslations.sourceTextWithTranslations]);

	const parsedContent = useMemo(() => {
		if (isHydrated) {
			const sanitizedContent = DOMPurify.sanitize(pageWithTranslations.content);
			const doc = new DOMParser().parseFromString(
				sanitizedContent,
				"text/html",
			);

			const elements = doc.querySelectorAll("[data-source-text-id]");
			for (const element of elements) {
				if (
					element instanceof HTMLElement &&
					element.getAttribute("data-source-text-id")
				) {
					const sourceTextId = element.getAttribute(
						"data-source-text-id",
					) as string;
					const sourceTextWrapper = document.createElement("span");
					sourceTextWrapper.classList.add("inline-block", "px-4");
					sourceTextWrapper.innerHTML = element.innerHTML;
					element.innerHTML = "";
					element.appendChild(sourceTextWrapper);
					const translationElement = document.createElement("span");
					translationElement.setAttribute("data-translation-id", sourceTextId);
					element.appendChild(translationElement);
				}
			}

			return parse(doc.body.innerHTML, {
				replace: (domNode) => {
					if (
						domNode.type === "tag" &&
						domNode.attribs["data-translation-id"]
					) {
						const sourceTextId = Number(domNode.attribs["data-translation-id"]);
						const sourceTextWithTranslations =
							pageWithTranslations.sourceTextWithTranslations.find(
								(info) => info.sourceText.id === sourceTextId,
							);
						// sourceLanguageがtargetLanguageと異なる場合は翻訳が存在しない場合でも表示する
						if (
							sourceTextWithTranslations &&
							(sourceTextWithTranslations.translationsWithVotes.length > 0 ||
								pageWithTranslations.sourceLanguage !== targetLanguage)
						) {
							return (
								<TranslationSection
									key={`translation-${sourceTextId}`}
									translationsWithVotes={
										sourceTextWithTranslations.translationsWithVotes
									}
									currentUserName={currentUserName}
									sourceTextId={sourceTextId}
								/>
							);
						}
					}
					return domNode;
				},
			});
		}
		return (
			<div className="w-full h-full flex items-center justify-center">
				<Loader2 className="w-10 h-10 animate-spin" />
			</div>
		);
	}, [
		pageWithTranslations.content,
		pageWithTranslations.sourceTextWithTranslations,
		pageWithTranslations.sourceLanguage,
		targetLanguage,
		currentUserName,
		isHydrated,
	]);

	return (
		<>
			<h1 className="!mb-5">
				<div className=" px-4 mb-2">
					{!pageWithTranslations.isPublished && (
						<Lock className="h-6 w-6 mr-1 inline" />
					)}
					{pageWithTranslations.title}
				</div>
				{bestTranslationTitle && (
					<TranslationSection
						translationsWithVotes={bestTranslationTitle.translationsWithVotes}
						currentUserName={currentUserName}
						sourceTextId={bestTranslationTitle.sourceText.id}
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
			{parsedContent}
		</>
	);
});

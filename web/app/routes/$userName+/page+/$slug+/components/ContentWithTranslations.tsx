import type { UserAITranslationInfo } from "@prisma/client";
import { Link } from "@remix-run/react";
import { Loader2, SquarePen } from "lucide-react";
import { useState, useCallback } from "react";
import { useHydrated } from "remix-utils/use-hydrated";
import { createPortal } from "react-dom";
import { Button } from "~/components/ui/button";
import type {
	PageWithTranslations,
	SourceTextWithTranslations,
} from "../types";
import { MemoizedParsedContent } from "./ParsedContent";
import { AddAndVoteTranslations } from "./sourceTextAndTranslationSection/AddAndVoteTranslations";
import { SourceTextAndTranslationSection } from "./sourceTextAndTranslationSection/SourceTextAndTranslationSection";
import { TranslateButton } from "./translateButton/TranslateButton";

interface ContentWithTranslationsProps {
	pageWithTranslations: PageWithTranslations;
	sourceTitleWithTranslations: SourceTextWithTranslations | null;
	currentUserName: string | undefined;
	hasGeminiApiKey: boolean;
	userAITranslationInfo: UserAITranslationInfo | null;
	targetLanguage: string;
	showOriginal: boolean;
	showTranslation: boolean;
}

export function ContentWithTranslations({
	pageWithTranslations,
	sourceTitleWithTranslations,
	currentUserName,
	hasGeminiApiKey,
	userAITranslationInfo,
	targetLanguage,
	showOriginal = true,
	showTranslation = true,
}: ContentWithTranslationsProps) {
	const isHydrated = useHydrated();
	const [selectedSourceTextId, setSelectedSourceTextId] = useState<
		number | null
	>(null);
	const [selectedTranslationEl, setSelectedTranslationEl] = useState<HTMLDivElement | null>(null);

	const handleOpenAddAndVoteTranslations = useCallback(
		(sourceTextId: number) => {
			setSelectedSourceTextId(
				sourceTextId === selectedSourceTextId ? null : sourceTextId
			);
		},
		[selectedSourceTextId],
	);

	const selectedSourceTextWithTranslations =
		pageWithTranslations.sourceTextWithTranslations.find(
			(stw) => stw.sourceText.id === selectedSourceTextId,
		);

	return (
		<>
			<div className="flex items-center justify-between">
				<h1 className="!mb-5">
					{sourceTitleWithTranslations && (
						<SourceTextAndTranslationSection
							sourceTextWithTranslations={sourceTitleWithTranslations}
							isPublished={pageWithTranslations.page.isPublished}
							elements={sourceTitleWithTranslations.sourceText.text}
							sourceLanguage={pageWithTranslations.page.sourceLanguage}
							targetLanguage={targetLanguage}
							onOpenAddAndVoteTranslations={handleOpenAddAndVoteTranslations}
							showOriginal={true}
							showTranslation={true}
							selectedSourceTextId={selectedSourceTextId}
							currentUserName={currentUserName}
							onSelectedRef={setSelectedTranslationEl}
						/>
					)}
				</h1>
				{pageWithTranslations.user.userName === currentUserName &&
					currentUserName && (
						<div className="ml-auto">
							<Button asChild variant="ghost">
								<Link
									to={`/${currentUserName}/page/${pageWithTranslations.page.slug}/edit`}
								>
									<SquarePen className="w-5 h-5" />
								</Link>
							</Button>
						</div>
					)}
			</div>
			<TranslateButton
				pageId={pageWithTranslations.page.id}
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
						<span className="text-xs text-gray-500">
							{pageWithTranslations.page.createdAt}
						</span>
					</div>
				</Link>
			</div>
			{!isHydrated ? (
				<div className="w-full h-full flex items-center justify-center">
					<Loader2 className="w-10 h-10 animate-spin" />
				</div>
			) : (
				<MemoizedParsedContent
					pageWithTranslations={pageWithTranslations}
					sourceLanguage={pageWithTranslations.page.sourceLanguage}
					targetLanguage={targetLanguage}
					currentUserName={currentUserName}
					onOpenAddAndVoteTranslations={handleOpenAddAndVoteTranslations}
					showOriginal={showOriginal}
					showTranslation={showTranslation}
					selectedSourceTextId={selectedSourceTextId}
					onSelectedRef={setSelectedTranslationEl}
				/>
			)}
			{selectedSourceTextWithTranslations && selectedTranslationEl && createPortal(
				<div className="overflow-hidden">
					<AddAndVoteTranslations
						key={`add-and-vote-translations-${selectedSourceTextWithTranslations.sourceText.id}`}
						open={true}
						onOpenChange={() => handleOpenAddAndVoteTranslations(selectedSourceTextWithTranslations.sourceText.id)}
						currentUserName={currentUserName}
						sourceTextWithTranslations={selectedSourceTextWithTranslations}
					/>
				</div>,
				selectedTranslationEl
			)}
		</>
	);
}

import { arrow, offset, shift, useFloating } from "@floating-ui/react";
import type { UserAITranslationInfo } from "@prisma/client";
import { Link } from "@remix-run/react";
import { Hash, Loader2, SquarePen } from "lucide-react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useHydrated } from "remix-utils/use-hydrated";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
	const [selectedTranslationEl, setSelectedTranslationEl] =
		useState<HTMLDivElement | null>(null);

	const handleOpenAddAndVoteTranslations = useCallback(
		(sourceTextId: number) => {
			setSelectedSourceTextId(
				sourceTextId === selectedSourceTextId ? null : sourceTextId,
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
			<div className="flex items-center">
				<h1 className="!mb-0 flex-1">
					{sourceTitleWithTranslations && (
						<SourceTextAndTranslationSection
							sourceTextWithTranslations={sourceTitleWithTranslations}
							isPublished={pageWithTranslations.page.isPublished}
							elements={sourceTitleWithTranslations.sourceText.text}
							sourceLanguage={pageWithTranslations.page.sourceLanguage}
							targetLanguage={targetLanguage}
							onOpenAddAndVoteTranslations={handleOpenAddAndVoteTranslations}
							showOriginal={showOriginal}
							showTranslation={showTranslation}
							selectedSourceTextId={selectedSourceTextId}
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
			<div className="flex flex-wrap gap-2 pt-2 pb-3">
				{pageWithTranslations.tagPages.map((tagPage) => (
					<div
						key={tagPage.tag.id}
						className="flex items-center gap-1 px-3 h-[32px] bg-secondary rounded-full text-sm text-secondary-foreground"
					>
						<button type="button" className="hover:text-destructive ml-1">
							<Hash className="w-3 h-3" />
						</button>
						<span>{tagPage.tag.name}</span>
					</div>
				))}
			</div>

			<div className="flex items-center not-prose">
				<Link
					to={`/${pageWithTranslations.user.userName}`}
					className="flex items-center mr-2 !no-underline hover:text-gray-700"
				>
					<Avatar className="w-12 h-12 flex-shrink-0 mr-3 ">
						<AvatarImage
							src={pageWithTranslations.user.icon}
							alt={pageWithTranslations.user.displayName}
						/>
						<AvatarFallback>
							{pageWithTranslations.user.displayName.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
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
			<TranslateButton
				pageId={pageWithTranslations.page.id}
				userAITranslationInfo={userAITranslationInfo}
				hasGeminiApiKey={hasGeminiApiKey}
				targetLanguage={targetLanguage}
			/>
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
			{selectedSourceTextWithTranslations &&
				selectedTranslationEl &&
				createPortal(
					<div className="overflow-hidden">
						<AddAndVoteTranslations
							key={`add-and-vote-translations-${selectedSourceTextWithTranslations.sourceText.id}`}
							open={true}
							onOpenChange={() =>
								handleOpenAddAndVoteTranslations(
									selectedSourceTextWithTranslations.sourceText.id,
								)
							}
							currentUserName={currentUserName}
							sourceTextWithTranslations={selectedSourceTextWithTranslations}				
						/>
					</div>,
					selectedTranslationEl,
				)}
		</>
	);
}

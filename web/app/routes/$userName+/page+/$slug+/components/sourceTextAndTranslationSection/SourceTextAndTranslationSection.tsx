import { Link } from "@remix-run/react";
import { Lock } from "lucide-react";
import { SquarePen } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import type { SourceTextWithTranslations } from "../../types";
import { TranslationSection } from "./TranslationSection";
interface SourceTextAndTranslationSectionProps {
	sourceTextWithTranslations: SourceTextWithTranslations;
	elements: string | ReactNode | ReactNode[];
	isPublished?: boolean;
	sourceTextClassName?: string;
	showOriginal: boolean;
	showTranslation: boolean;
	currentUserName: string | undefined;
	isOwner?: boolean;
	slug?: string;
}

export function SourceTextAndTranslationSection({
	sourceTextWithTranslations,
	elements,
	isPublished,
	sourceTextClassName,
	showOriginal = true,
	showTranslation = true,
	currentUserName,
	isOwner,
	slug,
}: SourceTextAndTranslationSectionProps) {
	return (
		<>
			{showOriginal && (
				<div className="flex items-center">
					<span
						className={`inline-block ${
							sourceTextWithTranslations.translationsWithVotes.length === 0 ||
							!showTranslation
								? "text-gray-700 dark:text-gray-200"
								: "text-gray-300 dark:text-gray-600"
						} ${sourceTextClassName}`}
					>
						{isPublished === false && <Lock className="h-6 w-6 mr-1 inline" />}
						{elements}
					</span>
					{isOwner && (
						<div className="ml-auto">
							<Button asChild variant="ghost">
								<Link to={`/${currentUserName}/page/${slug}/edit`}>
									<SquarePen className="w-5 h-5" />
								</Link>
							</Button>
						</div>
					)}
				</div>
			)}
			{showTranslation && (
				<TranslationSection
					key={`translation-${sourceTextWithTranslations.sourceText.id}`}
					sourceTextWithTranslations={sourceTextWithTranslations}
					currentUserName={currentUserName}
				/>
			)}
		</>
	);
}

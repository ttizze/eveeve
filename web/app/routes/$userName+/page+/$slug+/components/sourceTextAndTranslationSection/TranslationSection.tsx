import { MoreVertical } from "lucide-react";
import { Languages, Plus } from "lucide-react";
import { useHydrated } from "remix-utils/use-hydrated";
import type { SourceTextWithTranslations } from "../../types";
import { sanitizeAndParseText } from "../../utils/sanitize-and-parse-text.client";

interface TranslationSectionProps {
	sourceTextWithTranslations: SourceTextWithTranslations;
	onOpenAddAndVoteTranslations: (sourceTextId: number) => void;
}

export function TranslationSection({
	sourceTextWithTranslations,
	onOpenAddAndVoteTranslations,
}: TranslationSectionProps) {
	const isHydrated = useHydrated();

	const { bestTranslationWithVote, sourceText } = sourceTextWithTranslations;
	const sanitizedAndParsedText = bestTranslationWithVote ? (
		isHydrated ? (
			sanitizeAndParseText(bestTranslationWithVote.translateText.text)
		) : (
			bestTranslationWithVote.translateText.text
		)
	) : (
		<span className="flex items-center gap-2">
			<Plus size={24} />
			<Languages size={24} />
		</span>
	);

	return (
		<span className="group relative block rounded-md  pl-4 hover:bg-gray-300 dark:hover:bg-gray-700 ">
			<span className="notranslate  inline-block pl-4 pr-5 py-2">
				{sanitizedAndParsedText}
				<ToggleButton
					className="group-hover:text-gray-800 dark:group-hover:text-gray-300 "
					onClick={() => {
						onOpenAddAndVoteTranslations(sourceText.id);
					}}
				/>
			</span>
		</span>
	);
}

function ToggleButton({
	className,
	onClick,
}: {
	className?: string;
	onClick: () => void;
}) {
	const label = "Show translation options";

	return (
		<button
			type="button"
			className={"absolute top-2 right-0 md:right-1"}
			onClick={onClick}
			aria-label={label}
			title={label}
		>
			<MoreVertical
				className={`w-5 h-5 text-gray-500 rounded-md ${className}`}
			/>
		</button>
	);
}

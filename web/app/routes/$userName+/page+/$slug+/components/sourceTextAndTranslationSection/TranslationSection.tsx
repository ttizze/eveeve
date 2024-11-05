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
		<span
			className="group relative block rounded-md"
			onMouseUp={(e) => {
				// テキストが選択されている場合は何もしない
				if (window.getSelection()?.toString()) return;
				// 右クリックの場合は何もしない
				if (e.button === 2) return;
				onOpenAddAndVoteTranslations(sourceText.id);
			}}
		>
			<span className="notranslate inline-block  py-2 text-gray-700 dark:text-gray-200">
				{sanitizedAndParsedText}
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

import type { UserAITranslationInfo } from "@prisma/client";
import { Languages } from "lucide-react";
import { useState } from "react";
import TargetLanguageSelector from "./TargetLanguageSelector";
import { TranslateSettingsDialog } from "./TranslateSettingsDialog";

type TranslateActionSectionProps = {
	pageId: number;
	userAITranslationInfo: UserAITranslationInfo | null;
	hasGeminiApiKey: boolean;
	targetLanguage: string;
};

export function TranslateActionSection({
	pageId,
	userAITranslationInfo,
	hasGeminiApiKey,
	targetLanguage,
}: TranslateActionSectionProps) {
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	return (
		<div className="flex items-center pt-3 md:max-w-48">
			<Languages className="w-4 h-4 mr-2" />
			<TargetLanguageSelector targetLanguage={targetLanguage} />

			<TranslateSettingsDialog
				open={isSettingsOpen}
				onOpenChange={setIsSettingsOpen}
				pageId={pageId}
				targetLanguage={targetLanguage}
				hasGeminiApiKey={hasGeminiApiKey}
			/>
		</div>
	);
}

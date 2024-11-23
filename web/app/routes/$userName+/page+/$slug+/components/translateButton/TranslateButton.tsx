import type { UserAITranslationInfo } from "@prisma/client";
import { Form } from "@remix-run/react";
import { useNavigation } from "@remix-run/react";
import { Languages } from "lucide-react";
import { useState } from "react";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Button } from "~/components/ui/button";
import { GeminiApiKeyDialog } from "~/routes/resources+/gemini-api-key-dialog";
import TargetLanguageSelector from "./TargetLanguageSelector";
import { TranslateSettingsButton } from "./TranslateSettingsButton";
import { UserAITranslationStatus } from "./UserAITranslationStatus";

type TranslateButtonProps = {
	pageId: number;
	userAITranslationInfo: UserAITranslationInfo | null;
	hasGeminiApiKey: boolean;
	targetLanguage: string;
};

export function TranslateButton({
	pageId,
	userAITranslationInfo,
	hasGeminiApiKey,
	targetLanguage,
}: TranslateButtonProps) {
	const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
	const navigation = useNavigation();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	return (
		<>
			<div className="mb-5  rounded-xl px-4 py-4 bg-gray-100 dark:bg-gray-900 shadow-md dark:shadow-gray-800">
				<div className="flex flex-col space-y-2">
					<div className="flex items-center space-x-1">
						<TargetLanguageSelector targetLanguage={targetLanguage} />
						<TranslateSettingsButton onModelSelect={setSelectedModel} />
						<Form method="post" className="h-full">
							<input type="hidden" name="pageId" value={pageId} />
							<input type="hidden" name="aiModel" value={selectedModel} />
							{hasGeminiApiKey ? (
								<Button
									type="submit"
									name="intent"
									value="translate"
									size="default"
									variant="default"
									disabled={navigation.state === "submitting"}
								>
									{navigation.state === "submitting" ? (
										<LoadingSpinner />
									) : (
										<Languages className="w-4 h-4" />
									)}
								</Button>
							) : (
								<Button onClick={() => setIsDialogOpen(true)} size="default">
									<div className="flex items-center justify-center w-full">
										<Languages className="w-5 h-5" />
									</div>
								</Button>
							)}
						</Form>
					</div>
				</div>
				<UserAITranslationStatus
					userAITranslationInfo={userAITranslationInfo}
				/>
			</div>
			<GeminiApiKeyDialog
				isOpen={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			/>
		</>
	);
}

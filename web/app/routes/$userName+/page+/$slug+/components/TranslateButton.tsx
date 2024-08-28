import type { UserAITranslationInfo } from "@prisma/client";
import { Form } from "@remix-run/react";
import { useNavigation } from "@remix-run/react";
import { Languages } from "lucide-react";
import { useState } from "react";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Button } from "~/components/ui/button";
import { AIModelSelector } from "~/features/translate/components/AIModelSelector";
import TargetLanguageSelector from "./TargetLanguageSelector";
import { UserAITranslationStatus } from "./UserAITranslationStatus";

import { GeminiApiKeyDialog } from "~/routes/resources+/gemini-api-key-dialog";
type TranslateButtonProps = {
	pageId: number;
	userAITranslationInfo: UserAITranslationInfo | null;
	hasGeminiApiKey: boolean;
	currentLanguage: string;
};

export function TranslateButton({
	pageId,
	userAITranslationInfo,
	hasGeminiApiKey,
	currentLanguage,
}: TranslateButtonProps) {
	const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
	const navigation = useNavigation();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	return (
		<>
			<div className="mb-5  rounded-xl px-4 py-4 bg-gray-100 dark:bg-gray-900 shadow-inner">
				<div className="flex flex-col space-y-2">
					<div className="flex items-center space-x-1 h-10">
						<TargetLanguageSelector targetLanguage={currentLanguage} />
						<AIModelSelector
							onModelSelect={setSelectedModel}
							className="bg-background"
						/>
					</div>
					<div className="h-full">
						<Form method="post" className="h-full">
							<input type="hidden" name="pageId" value={pageId} />
							<input type="hidden" name="aiModel" value={selectedModel} />
							{hasGeminiApiKey ? (
								<Button
									type="submit"
									name="intent"
									value="translate"
									className="w-full h-full"
									disabled={navigation.state === "submitting"}
								>
									{navigation.state === "submitting" ? (
										<LoadingSpinner />
									) : (
										<div className="flex items-center justify-center w-full">
											<Languages className="w-5 h-5" />
										</div>
									)}
								</Button>
							) : (
								<Button onClick={() => setIsDialogOpen(true)}>
									<div className="flex items-center justify-center w-full">
										<Languages className="w-5 h-5" />
										<p>Add Translation</p>
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

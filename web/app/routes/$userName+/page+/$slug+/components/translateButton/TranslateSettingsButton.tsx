import { Settings } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { AIModelSelector } from "~/features/translate/components/AIModelSelector";

type TranslateSettingsProps = {
	onModelSelect: (model: string) => void;
};

export function TranslateSettingsButton({
	onModelSelect,
}: TranslateSettingsProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size="default" className="bg-background">
					<Settings className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Translation Settings</DialogTitle>
				</DialogHeader>
				<div className="py-4">
					<div className="space-y-4">
						<div>
							<h3 className="text-sm font-medium mb-2">AI Model</h3>
							<AIModelSelector
								onModelSelect={onModelSelect}
								className="w-full"
							/>
						</div>
						{/* Additional settings can be added here */}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

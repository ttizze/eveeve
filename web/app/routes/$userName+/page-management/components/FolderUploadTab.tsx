import { TranslationInputForm } from "./TranslationInputForm";

export function FolderUploadTab() {
	return (
		<div className="space-y-6">
			<div className="flex flex-col space-y-4">
				<h2 className="text-2xl font-bold tracking-tight">Folder Upload</h2>
				<p className="text-muted-foreground">
					Upload a folder containing markdown files to translate them
					automatically.
				</p>
			</div>
			<TranslationInputForm />
		</div>
	);
}

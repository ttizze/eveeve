import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

const geminiModels = [
	{ name: "gemini-1.5-flash", value: "gemini-1.5-flash" },
	{ name: "gemini-1.5-pro", value: "gemini-1.5-pro" },
];

interface AIModelSelectorProps {
	className?: string;
	onModelSelect: (model: string) => void;
}

export function AIModelSelector({
	onModelSelect,
	className,
}: AIModelSelectorProps) {
	const [selectedModel, setSelectedModel] = useState<string>(
		geminiModels[0].value,
	);

	const handleModelChange = (value: string) => {
		setSelectedModel(value);
		onModelSelect(value);
	};

	return (
		<Select value={selectedModel} onValueChange={handleModelChange}>
			<SelectTrigger className={className}>
				<SelectValue placeholder="Select a model" />
			</SelectTrigger>
			<SelectContent>
				{geminiModels.map((model) => (
					<SelectItem key={model.value} value={model.value}>
						{model.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

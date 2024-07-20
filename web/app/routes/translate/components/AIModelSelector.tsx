import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
	Form,
	useActionData,
	useNavigation,
	useSubmit,
} from "@remix-run/react";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { aiModelSchema } from "../types";
import { SelectConform } from "./SelectConform";

const predefinedModels = ["openai", "gemini", "claude"];

export function AIModelSelector({
	hasGeminiApiKey,
	hasOpenAIApiKey,
	hasClaudeApiKey,
}: {
	hasGeminiApiKey: boolean;
	hasOpenAIApiKey: boolean;
	hasClaudeApiKey: boolean;
}) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedModel, setSelectedModel] = useState<string | null>(null);
	const lastResult = useActionData<SubmissionResult>();
	const navigation = useNavigation();
	const submit = useSubmit();

	const [form, { modelType, apiKey }] = useForm({
		id: "ai-model-form",
		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: aiModelSchema });
		},
		shouldRevalidate: "onInput",
	});

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		submit(formData, { method: "post" });
		setIsDialogOpen(false);
	};

	const getModelOptions = () => [
		{
			name: "gemini-1.5-flash",
			value: "gemini-1.5-flash",
			hasApiKey: hasGeminiApiKey,
		},
		{
			name: "gemini-1.5-pro",
			value: "gemini-1.5-pro",
			hasApiKey: hasGeminiApiKey,
		},
	];

	const handleModelSelect = (value: string) => {
		const selectedOption = getModelOptions().find(
			(option) => option.value === value,
		);
		if (selectedOption && !selectedOption.hasApiKey) {
			setSelectedModel(value);
			setIsDialogOpen(true);
		}
	};

	return (
		<>
			<SelectConform
				meta={modelType}
				items={getModelOptions().map((option) => ({
					name: (
						<div className="flex items-center  ">
							<span>{option.name}</span>
							{!option.hasApiKey && (
								<AlertCircle className="h-4 w-4 ml-2 text-yellow-500" />
							)}
						</div>
					),
					value: option.value,
				}))}
				placeholder="Select a model"
				onValueChange={handleModelSelect}
			/>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Enter API Key for {selectedModel}</DialogTitle>
					</DialogHeader>
					<Form
						method="post"
						{...getFormProps(form)}
						onSubmit={handleSubmit}
						className="space-y-4"
					>
						<input type="hidden" name="modelType" value={selectedModel || ""} />
						<div>
							<Label htmlFor={apiKey.id}>API Key</Label>
							<Input
								{...getInputProps(apiKey, {
									type: "password",
									required: true,
								})}
							/>
							{apiKey.errors?.map((error) => (
								<p key={error} className="text-red-500 text-sm">
									{error}
								</p>
							))}
						</div>

						<Button type="submit" disabled={navigation.state === "submitting"}>
							{navigation.state === "submitting" ? "Saving..." : "Save API Key"}
						</Button>

						{form.errors && (
							<p className="text-red-500 text-center">{form.errors}</p>
						)}
					</Form>
				</DialogContent>
			</Dialog>
		</>
	);
}

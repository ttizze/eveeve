import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { Languages } from "lucide-react";
import { useState } from "react";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { AIModelSelector } from "~/features/translate/components/AIModelSelector";
import type { action } from "../route";
import { translationInputSchema } from "../types";

export function TranslationInputForm() {
	const navigation = useNavigation();
	const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
	const actionData = useActionData<typeof action>();

	const [form, fields] = useForm({
		lastResult: actionData?.lastResult,
		id: "translation-input-form",
		constraint: getZodConstraint(translationInputSchema),
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: translationInputSchema });
		},
	});

	return (
		<div className="space-y-4">
			<Form
				method="post"
				{...getFormProps(form)}
				encType="multipart/form-data"
				className="space-y-4"
			>
				<div className="flex space-x-1">
					<div className="flex-col flex-grow w-full">
						<input
							type="file"
							id="folder"
							name="folder"
							/* @ts-expect-error */
							directory=""
							webkitdirectory=""
							multiple
							className="mt-1 block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
						/>
					</div>
					<div className="w-[200px]">
						<AIModelSelector onModelSelect={setSelectedModel} />
					</div>
					<input type="hidden" name="aiModel" value={selectedModel} />
					<Button type="submit" disabled={navigation.state === "submitting"}>
						{navigation.state === "submitting" ? (
							<LoadingSpinner />
						) : (
							<Languages className="w-4 h-4 " />
						)}
					</Button>
				</div>
			</Form>
			{actionData?.slugs && actionData.slugs.length > 0 && (
				<Alert className="bg-blue-50 border-blue-200 text-blue-800 animate-in fade-in duration-300">
					<AlertTitle className="text-center">
						Translation Job Started
					</AlertTitle>
					<AlertDescription className="text-center">
						<strong className="font-semibold ">{actionData.slugs[0]}</strong>
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}

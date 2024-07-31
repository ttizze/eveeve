import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, useNavigation } from "@remix-run/react";
import { Languages } from "lucide-react";
import { useState } from "react";
import { useTypedActionData } from "remix-typedjson";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { AIModelSelector } from "~/feature/translate/components/AIModelSelector";
import type { action } from "../route";
import { urlTranslationSchema } from "../types";

export function URLTranslationForm() {
	const navigation = useNavigation();
	const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
	const actionData = useTypedActionData<typeof action>();
	const [form, fields] = useForm({
		lastResult: actionData?.lastResult,
		id: "url-translation-form",
		constraint: getZodConstraint(urlTranslationSchema),
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: urlTranslationSchema });
		},
	});

	return (
		<div className="space-y-4">
			<Form method="post" {...getFormProps(form)} className="space-y-4">
				<div className="flex space-x-1">
					<div className="flex-col flex-grow w-full">
						<Input
							className="bg-gray-800 text-white w-full"
							placeholder="https://example.com"
							{...getInputProps(fields.url, { type: "url" })}
						/>
						<div id={fields.url.errorId}>{fields.url.errors}</div>
					</div>
					<div className="w-[200px]">
						<AIModelSelector onModelSelect={setSelectedModel} />
					</div>
					<input type="hidden" name="model" value={selectedModel} />
					<Button type="submit" disabled={navigation.state === "submitting"}>
						{navigation.state === "submitting" ? (
							<LoadingSpinner />
						) : (
							<Languages className="w-4 h-4 " />
						)}
					</Button>
				</div>
			</Form>
			{actionData?.url && (
				<Alert className="bg-blue-50 border-blue-200 text-blue-800 animate-in fade-in duration-300">
					<AlertTitle className="text-center">
						Translation Job Started
					</AlertTitle>
					<AlertDescription className="text-center">
						<strong className="font-semibold ">{actionData.url}</strong>
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}

export { urlTranslationSchema };

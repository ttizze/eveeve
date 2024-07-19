import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, useNavigation } from "@remix-run/react";
import { Languages } from "lucide-react";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { urlTranslationSchema } from "../types";
import { AIModelSelector } from "./AIModelSelector";

export function URLTranslationForm({
	hasGeminiApiKey,
	hasOpenAIApiKey,
	hasClaudeApiKey,
}: {
	hasGeminiApiKey: boolean;
	hasOpenAIApiKey: boolean;
	hasClaudeApiKey: boolean;
}) {
	const navigation = useNavigation();

	const [form, fields] = useForm({
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
				<div className="flex">
					<div className="flex-col flex-grow w-full">
						<Input
							className="bg-gray-800 text-white w-full"
							placeholder="https://example.com"
							{...getInputProps(fields.url, { type: "url" })}
						/>
						<div id={fields.url.errorId}>{fields.url.errors}</div>
					</div>
					<AIModelSelector
						hasGeminiApiKey={hasGeminiApiKey}
						hasOpenAIApiKey={hasOpenAIApiKey}
						hasClaudeApiKey={hasClaudeApiKey}
					/>
					<Button
						type="submit"
						name="intent"
						value="translateUrl"
						disabled={navigation.state === "submitting"}
					>
						{navigation.state === "submitting" ? (
							<LoadingSpinner />
						) : (
							<Languages className="w-4 h-4 " />
						)}
					</Button>
				</div>
			</Form>
		</div>
	);
}

export { urlTranslationSchema };

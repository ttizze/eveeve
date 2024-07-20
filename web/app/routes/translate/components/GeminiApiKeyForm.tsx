import { useForm } from "@conform-to/react";
import { getFormProps, getInputProps } from "@conform-to/react";
import type { SubmissionResult } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, useActionData } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { useNavigation } from "@remix-run/react";
import { Save } from "lucide-react";
import { ExternalLink, Key } from "lucide-react";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { geminiApiKeySchema } from "../types";

export function GeminiApiKeyForm() {
	const lastResult = useActionData<SubmissionResult>();
	const navigation = useNavigation();
	const [form, { geminiApiKey }] = useForm({
		id: "gemini-api-key-form",
		lastResult,
		constraint: getZodConstraint(geminiApiKeySchema),
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: geminiApiKeySchema });
		},
	});

	return (
		<Card className="w-full max-w-md mx-auto ">
			<CardHeader>
				<CardTitle className="text-center">Set Gemini API Key</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="text-center mb-4">
					<Link
						to="https://aistudio.google.com/app/apikey"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 transition-colors underline hover:text-blue-500"
					>
						<Button
							variant="default"
							size="sm"
							className="gap-2 shadow-md hover:shadow-lg transition-shadow"
						>
							<span className="">Get API Key at Google AI Studio</span>
							<Key className="w-4 h-4" />
							<ExternalLink className="w-4 h-4" />
						</Button>
					</Link>
				</div>
				<Form method="post" {...getFormProps(form)}>
					<div className="flex items-center">
						<div className="w-full">
							<Input
								{...getInputProps(geminiApiKey, {
									type: "password",
									required: true,
								})}
								className="flex-grow"
								placeholder="Enter your Gemini API Key"
							/>
						</div>
						<Button
							type="submit"
							name="intent"
							value="saveGeminiApiKey"
							size="icon"
							disabled={navigation.state === "submitting"}
						>
							{navigation.state === "submitting" ? (
								<LoadingSpinner />
							) : (
								<Save className="w-4 h-4" />
							)}
						</Button>
					</div>
					<div
						id={geminiApiKey.errorId}
						className="text-red-500 text-center mt-2"
					>
						{geminiApiKey.errors}
					</div>
					{form.errors && (
						<p className="text-red-500 text-center mt-2">{form.errors}</p>
					)}
				</Form>
			</CardContent>
		</Card>
	);
}

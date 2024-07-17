import { useForm } from "@conform-to/react";
import { getFormProps, getInputProps } from "@conform-to/react";
import type { SubmissionResult } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form } from "@remix-run/react";
import { useActionData } from "@remix-run/react";
import { Save } from "lucide-react";
import { GoogleForm } from "~/components/GoogleForm";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { geminiApiKeySchema } from "../types";
interface GoogleSignInAndGeminiApiKeyFormProps {
	isLoggedIn: boolean;
	hasGeminiApiKey: boolean;
	error?: string;
}

export function GoogleSignInAndGeminiApiKeyForm({
	isLoggedIn,
	hasGeminiApiKey,
}: GoogleSignInAndGeminiApiKeyFormProps) {
	const lastResult = useActionData<SubmissionResult>();
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
		<Card className="w-full max-w-md mx-auto bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">
			<CardHeader>
				<CardTitle className="text-center">
					{isLoggedIn
						? hasGeminiApiKey
							? "Update Gemini API Key"
							: "Set Gemini API Key"
						: "Sign in and Set Gemini API Key"}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 ">
				{!isLoggedIn && (
					<div className="mb-4">
						<GoogleForm />
					</div>
				)}
				{isLoggedIn && !hasGeminiApiKey && (
					<Form method="post" {...getFormProps(form)}>
						<div className="space-y-2 flex items-center">
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
							>
								<Save className="w-4 h-4" />
							</Button>
						</div>
						<div id={geminiApiKey.errorId} className="text-red-500 text-center">
							{geminiApiKey.errors}
						</div>
						{form.errors && (
							<p className="text-red-500 text-center">{form.errors}</p>
						)}
					</Form>
				)}
			</CardContent>
		</Card>
	);
}

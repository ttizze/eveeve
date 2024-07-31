import { useForm } from "@conform-to/react";
import { getFormProps, getInputProps } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { Save } from "lucide-react";
import { ExternalLink, Key } from "lucide-react";
import { TriangleAlert } from "lucide-react";
import { z } from "zod";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { validateGeminiApiKey } from "~/feature/translate/utils/gemini";
import { authenticator } from "~/utils/auth.server";
import { updateGeminiApiKey } from "./functions/mutations.server";

export const geminiApiKeySchema = z.object({
	geminiApiKey: z.string().min(1, "API key is required"),
});

export async function action({ request }: ActionFunctionArgs) {
	const safeUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/",
	});
	const submission = parseWithZod(await request.formData(), {
		schema: geminiApiKeySchema,
	});
	if (submission.status !== "success") {
		return { lastResult: submission.reply() };
	}

	const { isValid, errorMessage } = await validateGeminiApiKey(
		submission.value.geminiApiKey,
	);
	if (!isValid) {
		return {
			lastResult: submission.reply({
				formErrors: [errorMessage || "Gemini API key validation failed"],
			}),
		};
	}
	await updateGeminiApiKey(safeUser.id, submission.value.geminiApiKey);
	return { lastResult: submission.reply({ resetForm: true }) };
}

export function GeminiApiKeyForm() {
	const fetcher = useFetcher<typeof action>();
	const actionData = fetcher.data;
	const [form, { geminiApiKey }] = useForm({
		id: "gemini-api-key-form",
		lastResult: actionData?.lastResult,
		constraint: getZodConstraint(geminiApiKeySchema),
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: geminiApiKeySchema });
		},
	});

	return (
		<Card className="w-full mx-auto ">
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
				<Alert variant="default" className="flex items-center justify-center">
					<div className="flex items-center gap-2">
						<TriangleAlert className="h-10 w-4 text-yellow-400" />
						<AlertDescription>
							法律に違反する使用や、許可のない商用利用はお控えください。
							<br />
							API Keyを保存することで、
							<Link
								to="/terms"
								className="text-blue-600 hover:underline"
								target="_blank"
							>
								利用規約
							</Link>
							に同意したものとみなされます。
						</AlertDescription>
					</div>
				</Alert>
				<fetcher.Form
					method="post"
					action="/resources/gemini-api-key-form"
					{...getFormProps(form)}
				>
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
							size="icon"
							disabled={fetcher.state === "submitting"}
						>
							{fetcher.state === "submitting" ? (
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
				</fetcher.Form>
			</CardContent>
		</Card>
	);
}

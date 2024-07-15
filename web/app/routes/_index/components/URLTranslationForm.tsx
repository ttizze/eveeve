import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
	Form,
	Link,
	useActionData,
	useNavigation,
	useSubmit,
} from "@remix-run/react";
import { z } from "zod";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

const urlTranslationSchema = z.object({
	url: z.string().url("有効なURLを入力してください"),
	targetLanguage: z.string().min(2).max(5),
});

export function URLTranslationForm() {
	const navigation = useNavigation();
	const submit = useSubmit();

	const actionData = useActionData<{
		result: { status: "error" | "success"; errors?: string[] };
		url?: string;
		title?: string;
		targetLanguage?: string;
	}>();

	const [form, fields] = useForm({
		id: "url-translation-form",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: urlTranslationSchema });
		},
		onSubmit(event, { formData }) {
			event.preventDefault();
			console.log("Form submitted", Object.fromEntries(formData));
			submit(formData, { method: "post" });
		},
	});

	return (
		<div className="space-y-4">
			<Form method="post" {...getFormProps(form)} className="space-y-4">
				<div className="flex space-x-2">
					<Input
						type="url"
						name="url"
						placeholder="翻訳したいWebページのURLを入力"
						required
						className="flex-grow"
					/>
					<Button type="submit" disabled={navigation.state === "submitting"}>
						{navigation.state === "submitting" ? "翻訳中..." : "翻訳開始"}
					</Button>
				</div>
			</Form>

			{actionData?.result.status === "error" && (
				<Alert variant="destructive">
					<AlertDescription>
						<ul>
							{actionData.result.errors?.map((error) => (
								<li key={error}>{error}</li>
							))}
						</ul>
					</AlertDescription>
				</Alert>
			)}

			{actionData?.result.status === "success" && (
				<div className="mt-4">
					<Link
						to={`/reader/${encodeURIComponent(actionData.url || "")}?lang=${actionData.targetLanguage}`}
						className="text-blue-500 hover:underline"
					>
						<h2 className="text-xl font-semibold">{actionData.title}</h2>
					</Link>
				</div>
			)}
		</div>
	);
}

export { urlTranslationSchema };
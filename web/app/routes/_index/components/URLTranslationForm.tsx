import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, useNavigation } from "@remix-run/react";
import { Languages } from "lucide-react";
import { z } from "zod";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

const urlTranslationSchema = z.object({
	url: z
		.string()
		.min(1, { message: "URLを入力してください" })
		.url("有効なURLを入力してください"),
});

export function URLTranslationForm() {
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
				<div className="flex space-x-2">
					<div className="flex-col flex-grow">
						<Input
							className="bg-gray-800 text-white"
							placeholder="https://example.com"
							{...getInputProps(fields.url, { type: "url" })}
						/>
						<div id={fields.url.errorId}>{fields.url.errors}</div>
					</div>
					<Button type="submit" name="intent" value="translateUrl" disabled={navigation.state === "submitting"}>
						{navigation.state === "submitting" ? (
							<LoadingSpinner />
						) : (
							<Languages className="w-4 h-4 "  />
						)}
					</Button>
				</div>
			</Form>
		</div>
	);
}

export { urlTranslationSchema };

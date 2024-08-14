import { getFormProps, getTextareaProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { getZodConstraint } from "@conform-to/zod";
import { useFetcher } from "@remix-run/react";
import { Save } from "lucide-react";
import { useState } from "react";
import { LoginDialog } from "~/components/LoginDialog";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import type { action } from "..";
import { addTranslationSchema } from "../types";

interface AddTranslationFormProps {
	sourceTextId: number;
	currentUserName: string | null;
}

export function AddTranslationForm({
	sourceTextId,
	currentUserName,
}: AddTranslationFormProps) {
	const fetcher = useFetcher<typeof action>();
	const [showLoginDialog, setShowLoginDialog] = useState(false);
	const [form, fields] = useForm({
		lastResult: fetcher.data?.lastResult,
		id: `add-translation-form-${sourceTextId}`,
		constraint: getZodConstraint(addTranslationSchema),
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: addTranslationSchema });
		},
	});

	const handleInteraction = (e: React.MouseEvent | React.FocusEvent) => {
		if (!currentUserName) {
			e.preventDefault();
			setShowLoginDialog(true);
		}
	};

	return (
		<div className="mt-4">
			<fetcher.Form method="post" {...getFormProps(form)}>
				{form.errors}
				<input type="hidden" name="sourceTextId" value={sourceTextId} />
				<Textarea
					{...getTextareaProps(fields.text)}
					className="w-full mb-2 h-24 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
					placeholder="Enter your translation..."
					onFocus={handleInteraction}
					onClick={handleInteraction}
				/>
				<div className="space-x-2 flex justify-end items-center">
					{fields.text.errors && (
						<p className="text-red-500 text-sm">{fields.text.errors}</p>
					)}
					<Button
						type="submit"
						name="intent"
						value="add"
						className="bg-blue-500 hover:bg-blue-600 text-white"
						disabled={fetcher.state !== "idle" || !currentUserName}
					>
						<Save className="h-4 w-4" />
					</Button>
				</div>
			</fetcher.Form>
			<LoginDialog isOpen={showLoginDialog} onOpenChange={setShowLoginDialog} />
		</div>
	);
}

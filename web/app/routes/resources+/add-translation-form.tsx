import { getFormProps, getTextareaProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { getZodConstraint } from "@conform-to/zod";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { ArrowUpFromLine } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { LoginDialog } from "~/components/LoginDialog";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { authenticator } from "~/utils/auth.server";
import { getTargetLanguage } from "~/utils/target-language.server";
import { addUserTranslation } from "./functions/mutations.server";

const schema = z.object({
	sourceTextId: z.number(),
	text: z
		.string()
		.min(1, "Translation cannot be empty")
		.max(30000, "Translation is too long")
		.transform((val) => val.trim()),
});

export async function action({ request }: ActionFunctionArgs) {
	const currentUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/auth/login",
	});
	const submission = parseWithZod(await request.formData(), {
		schema,
	});
	const targetLanguage = await getTargetLanguage(request);

	if (submission.status !== "success") {
		return { lastResult: submission.reply() };
	}
	await addUserTranslation(
		submission.value.sourceTextId,
		submission.value.text,
		currentUser.id,
		targetLanguage,
	);
	return {
		lastResult: submission.reply({ resetForm: true }),
	};
}

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
		constraint: getZodConstraint(schema),
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema });
		},
	});

	const handleAction = (e: React.MouseEvent | React.FocusEvent) => {
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
					onFocus={handleAction}
					onClick={handleAction}
				/>
				<div className="space-x-2 flex justify-end items-center">
					{fields.text.errors && (
						<p className="text-red-500 text-sm">{fields.text.errors}</p>
					)}
					<Button
						type="submit"
						name="intent"
						value="add"
						className=""
						disabled={fetcher.state !== "idle" || !currentUserName}
					>
						<ArrowUpFromLine className="h-4 w-4" />
					</Button>
				</div>
			</fetcher.Form>
			<LoginDialog isOpen={showLoginDialog} onOpenChange={setShowLoginDialog} />
		</div>
	);
}

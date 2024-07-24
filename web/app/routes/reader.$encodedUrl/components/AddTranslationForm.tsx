import { getFormProps, getTextareaProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useFetcher } from "@remix-run/react";
import { Edit, Save, Trash } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { addTranslationSchema } from "../types";

interface AddTranslationFormProps {
	sourceTextId: number;
}

export function AddTranslationForm({ sourceTextId }: AddTranslationFormProps) {
	const fetcher = useFetcher();
	const [isEditing, setIsEditing] = useState(false);

	const [form, fields] = useForm({
		id: `add-translation-form-${sourceTextId}`,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: addTranslationSchema });
		},
	});

	if (!isEditing) {
		return (
			<div className="mt-4 flex justify-end">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setIsEditing(true)}
					className="text-blue-600 hover:bg-blue-50"
				>
					<Edit className="h-4 w-4" />
				</Button>
			</div>
		);
	}

	return (
		<div className="mt-4">
			<fetcher.Form method="post" {...getFormProps(form)}>
				{form.errors}
				<input type="hidden" name="sourceTextId" value={sourceTextId} />
				<Textarea
					{...getTextareaProps(fields.text)}
					className="w-full mb-2 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
					placeholder="Enter your translation..."
				/>
				{fields.text.errors && (
					<p className="text-red-500">{fields.text.errors}</p>
				)}
				<div className="space-x-2 flex justify-end">
					<Button
						type="submit"
						name="intent"
						value="add"
						className="bg-green-500 hover:bg-green-600 text-white"
						disabled={fetcher.state !== "idle"}
					>
						<Save className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						onClick={() => setIsEditing(false)}
						className="text-red-600 hover:bg-red-50"
					>
						<Trash className="h-4 w-4" />
					</Button>
				</div>
			</fetcher.Form>
		</div>
	);
}

import {
	getFormProps,
	getInputProps,
	getTextareaProps,
	useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { useNavigation } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { GeminiApiKeyDialog } from "~/routes/resources+/gemini-api-key-dialog";
import { authenticator, sanitizeUser } from "~/utils/auth.server";
import { commitSession, getSession } from "~/utils/session.server";
import { updateUser } from "./functions/mutations.server";
const schema = z.object({
	displayName: z
		.string()
		.min(1, "Display name is required")
		.max(50, "Display name must be 50 characters or less"),
	profile: z.string().max(200, "Profile must be 200 characters or less"),
});

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const currentUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});
	if (currentUser.userName !== params.userName) {
		throw new Response("Unauthorized", { status: 403 });
	}

	return typedjson({ currentUser });
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const currentUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});
	const submission = parseWithZod(await request.formData(), { schema });

	if (submission.status !== "success") {
		return submission.reply();
	}

	const { displayName, profile } = submission.value;

	const updatedUser = await updateUser(currentUser.userName, {
		displayName,
		profile,
	});
	const session = await getSession(request.headers.get("Cookie"));
	session.set("user", sanitizeUser(updatedUser));
	await commitSession(session);
	return null;
};

export default function EditProfile() {
	const { currentUser } = useTypedLoaderData<typeof loader>();
	const [isGeminiApiKeyDialogOpen, setIsGeminiApiKeyDialogOpen] =
		useState(false);
	const navigation = useNavigation();
	const [form, { displayName, profile }] = useForm({
		id: "edit-profile-form",
		constraint: getZodConstraint(schema),
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		defaultValue: {
			displayName: currentUser.displayName,
			profile: currentUser.profile,
		},
		onValidate({ formData }) {
			return parseWithZod(formData, { schema });
		},
	});
	return (
		<div className="container mx-auto mt-10">
			<Link to={`/${currentUser.userName}`}>
				<ArrowLeft className="w-6 h-6 mb-10" />
			</Link>
			<div className="rounded-xl border p-4 shadow-md">
				<h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
				<Form method="post" {...getFormProps(form)} className="space-y-4">
					<div>
						<Label htmlFor={displayName.id}>Display Name</Label>
						<Input {...getInputProps(displayName, { type: "text" })} />
						<div id={displayName.errorId} className="text-red-500 text-sm mt-1">
							{displayName.errors}
						</div>
					</div>
					<div>
						<Label htmlFor={profile.id}>Profile</Label>
						<textarea
							{...getTextareaProps(profile)}
							className="w-full h-32 px-3 py-2  border rounded-lg focus:outline-none"
						/>
						<div id={profile.errorId} className="text-red-500 text-sm mt-1">
							{profile.errors}
						</div>
					</div>
					<Button
						type="submit"
						className="w-full"
						disabled={navigation.state === "submitting"}
					>
						Save
					</Button>
				</Form>
			</div>
			<div className="mt-16 rounded-xl border p-4 shadow-md">
				<h1 className="text-3xl font-bold mb-6">Change Gemini API Key</h1>
				<Button
					className="w-full"
					onClick={() => setIsGeminiApiKeyDialogOpen(true)}
				>
					Change Gemini API Key
				</Button>
				<GeminiApiKeyDialog
					isOpen={isGeminiApiKeyDialogOpen}
					onOpenChange={setIsGeminiApiKeyDialogOpen}
				/>
			</div>
		</div>
	);
}

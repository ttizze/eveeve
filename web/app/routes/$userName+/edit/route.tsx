import {
	getFormProps,
	getInputProps,
	getTextareaProps,
	useForm,
	useInputControl,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useNavigation } from "@remix-run/react";
import { ArrowLeft, ArrowUpFromLine, Check, Key, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { uploadImage } from "~/routes/$userName+/utils/uploadImage";
import { GeminiApiKeyDialog } from "~/routes/resources+/gemini-api-key-dialog";
import { authenticator, sanitizeUser } from "~/utils/auth.server";
import { commitSession, getSession } from "~/utils/session.server";
import { updateUser } from "./functions/mutations.server";
import { getUserByUserName } from "./functions/queries.server";

const schema = z.object({
	displayName: z
		.string()
		.min(1, "Display name is required")
		.max(50, "Display name must be 50 characters or less"),
	profile: z.string().max(200, "Profile must be 200 characters or less"),
	icon: z.string(),
});

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const currentUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});
	if (currentUser.userName !== params.userName) {
		throw new Response("Unauthorized", { status: 403 });
	}
	const updatedUser = await getUserByUserName(currentUser.userName);
	if (!updatedUser) {
		throw new Response("Not Found", { status: 404 });
	}
	return typedjson({ currentUser: updatedUser });
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const currentUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});
	const submission = parseWithZod(await request.formData(), { schema });
	if (submission.status !== "success") {
		return submission.reply();
	}

	const { displayName, profile, icon } = submission.value;

	const updatedUser = await updateUser(currentUser.userName, {
		displayName,
		profile,
		icon,
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
	const [showSuccess, setShowSuccess] = useState(false);
	useEffect(() => {
		if (navigation.state === "loading") {
			setShowSuccess(true);
		} else if (navigation.state === "idle" && showSuccess) {
			const timer = setTimeout(() => setShowSuccess(false), 500);
			return () => clearTimeout(timer);
		}
	}, [navigation.state, showSuccess]);
	const [form, fields] = useForm({
		id: "edit-profile-form",
		constraint: getZodConstraint(schema),
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		defaultValue: {
			displayName: currentUser.displayName,
			profile: currentUser.profile,
			icon: currentUser.icon,
		},
		onValidate({ formData }) {
			return parseWithZod(formData, { schema });
		},
	});

	const imageForm = useInputControl(fields.icon);
	const [profileIconUrl, setProfileIconUrl] = useState<string>(
		currentUser.icon,
	);

	const handleProfileImageUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (file) {
			const url = await uploadImage(file);
			if (url) {
				imageForm.change(url);
				setProfileIconUrl(url);
			}
		}
	};

	return (
		<div className="container mx-auto">
			<Link to={`/${currentUser.userName}`}>
				<ArrowLeft className="w-6 h-6 mb-5" />
			</Link>
			<div className="rounded-xl border p-4 shadow-md bg-gray-200 dark:bg-gray-900">
				<div className="rounded-xl border p-4 shadow-md dark:shadow-gray-700  bg-white dark:bg-gray-800">
					<Form method="post" {...getFormProps(form)} className="space-y-4">
						<div>
							<img
								src={profileIconUrl}
								alt="Preview"
								className="mt-2 w-40 h-40 object-cover rounded-full"
							/>
							<Input
								id={fields.icon.id}
								type="file"
								accept="image/*"
								onChange={handleProfileImageUpload}
								className="mt-3 bg-white dark:bg-black/50 cursor-pointer"
							/>
							<div
								id={fields.icon.errorId}
								className="text-red-500 text-sm mt-1"
							>
								{fields.icon.errors}
							</div>
						</div>
						<div>
							<Input
								{...getInputProps(fields.displayName, { type: "text" })}
								className="w-full h-10 px-3 py-2 border rounded-lg  bg-white dark:bg-black/50 focus:outline-none"
							/>
							<div
								id={fields.displayName.errorId}
								className="text-red-500 text-sm mt-1"
							>
								{fields.displayName.errors}
							</div>
						</div>
						<div>
							<textarea
								{...getTextareaProps(fields.profile)}
								className="w-full h-32 px-3 py-2  border rounded-lg  bg-white dark:bg-black/50 focus:outline-none"
							/>
							<div
								id={fields.profile.errorId}
								className="text-red-500 text-sm mt-1"
							>
								{fields.profile.errors}
							</div>
						</div>

						<Button
							type="submit"
							className="w-full h-10"
							disabled={navigation.state === "submitting"}
						>
							{showSuccess ? (
								<Check className="w-6 h-6" />
							) : navigation.state === "submitting" ? (
								<Loader2 className="w-6 h-6 animate-spin" />
							) : (
								<ArrowUpFromLine className="w-6 h-6" />
							)}
						</Button>
					</Form>
				</div>
				<div className="mt-10 rounded-xl border p-4 shadow-md dark:shadow-gray-700 bg-white dark:bg-gray-800">
					<h2 className="text-xl font-bold mb-3 flex items-center gap-2">
						<Key className="w-5 h-5" />
						Gemini API Key
					</h2>
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
		</div>
	);
}

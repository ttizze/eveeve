import {
	getFormProps,
	getInputProps,
	getTextareaProps,
	useForm,
	useInputControl,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { useNavigation } from "@remix-run/react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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
	image: z.string(),
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

	const { displayName, profile, image } = submission.value;

	const updatedUser = await updateUser(currentUser.userName, {
		displayName,
		profile,
		image,
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
			image: currentUser.image,
		},
		onValidate({ formData }) {
			return parseWithZod(formData, { schema });
		},
	});

	const imageForm = useInputControl(fields.image);
	const [profileIconUrl, setProfileIconUrl] = useState<string>(
		currentUser.image,
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
			<div className="rounded-xl border p-4 shadow-md">
				<div className="rounded-xl border p-4 ">
					<h2 className="text-xl font-bold mb-3">Edit Profile</h2>
					<Form method="post" {...getFormProps(form)} className="space-y-4">
						<div>
							<Label htmlFor="image-upload">Icon</Label>
							<img
								src={profileIconUrl}
								alt="Preview"
								className="mt-2 w-40 h-40 object-cover rounded-full"
							/>
							<Input
								id={fields.image.id}
								type="file"
								accept="image/*"
								onChange={handleProfileImageUpload}
								className="mt-1"
							/>
							<div
								id={fields.image.errorId}
								className="text-red-500 text-sm mt-1"
							>
								{fields.image.errors}
							</div>
						</div>
						<div>
							<Label htmlFor={fields.displayName.id}>Display Name</Label>
							<Input {...getInputProps(fields.displayName, { type: "text" })} />
							<div
								id={fields.displayName.errorId}
								className="text-red-500 text-sm mt-1"
							>
								{fields.displayName.errors}
							</div>
						</div>
						<div>
							<Label htmlFor={fields.profile.id}>Profile</Label>
							<textarea
								{...getTextareaProps(fields.profile)}
								className="w-full h-32 px-3 py-2  border rounded-lg focus:outline-none"
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
								"Save"
							)}
						</Button>
					</Form>
				</div>
				<div className="mt-10 rounded-xl border p-4 shadow-md">
					<h2 className="text-xl font-bold mb-3">Gemini API Key</h2>
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

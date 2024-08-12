import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authenticator } from "~/utils/auth.server";
import { commitSession, getSession } from "~/utils/session.server";
import { updateUser } from "./functions/mutations.server";

const schema = z.object({
	displayName: z
		.string()
		.min(1, "Display name is required")
		.max(50, "Display name must be 50 characters or less"),
});

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const safeUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});
	if (safeUser.userName !== params.userName) {
		throw new Response("Unauthorized", { status: 403 });
	}

	return typedjson({ safeUser });
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const safeUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});
	const submission = parseWithZod(await request.formData(), { schema });

	if (submission.status !== "success") {
		return submission.reply();
	}

	const { displayName } = submission.value;

	await updateUser(safeUser.id, { displayName });
	const session = await getSession(request.headers.get("Cookie"));
	const updatedUser = { ...safeUser, displayName };
	session.set("user", updatedUser);

	return redirect(`/${safeUser.userName}`, {
		headers: {
			"Set-Cookie": await commitSession(session),
		},
	});
};

export default function EditProfile() {
	const { safeUser } = useTypedLoaderData<typeof loader>();

	const [form, { displayName }] = useForm({
		id: "edit-profile-form",
		constraint: getZodConstraint(schema),
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		defaultValue: { displayName: safeUser.displayName },
		onValidate({ formData }) {
			return parseWithZod(formData, { schema });
		},
	});
	return (
		<div className="container mx-auto mt-10">
			<h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
			<Form method="post" {...getFormProps(form)} className="space-y-4">
				<div>
					<Label htmlFor={displayName.id}>Display Name</Label>
					<Input {...getInputProps(displayName, { type: "text" })} />
					<div id={displayName.errorId} className="text-red-500 text-sm mt-1">
						{displayName.errors}
					</div>
				</div>
				<Button type="submit">Save Changes</Button>
			</Form>
		</div>
	);
}

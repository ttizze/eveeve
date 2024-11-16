import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { ArrowRight } from "lucide-react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { authenticator } from "~/utils/auth.server";
import { sanitizeUser } from "~/utils/sanitizeUser";
import { commitSession, getSession } from "~/utils/session.server";
import { updateUserName } from "./functions/mutations.server";
import { isUserNameTaken } from "./functions/queries.server";
import reservedUsernames from "./reserved-usernames.json";

function getAppRoutes() {
	return [];
}

// 予約語リストの作成
const RESERVED_USERNAMES = [
	...new Set([...reservedUsernames, ...getAppRoutes()]),
];

const schema = z.object({
	userName: z
		.string()
		.min(3, "Must be at least 3 characters")
		.max(20, "Must be 20 characters or less")
		.regex(
			/^[a-zA-Z][a-zA-Z0-9-]*$/,
			"Must start with a letter and can only contain letters, numbers, and hyphens",
		)
		.refine(
			(name) => !RESERVED_USERNAMES.includes(name.toLowerCase()),
			"This username cannot be used",
		)
		.refine(
			(name) => !/^\d+$/.test(name),
			"Username cannot consist of only numbers",
		),
});

export async function loader({ request }: LoaderFunctionArgs) {
	const currentUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/auth/login",
	});
	return { currentUser };
}

export async function action({ request }: ActionFunctionArgs) {
	const currentUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/auth/login",
	});
	const submission = parseWithZod(await request.formData(), { schema });

	if (submission.status !== "success") {
		return submission.reply();
	}

	const { userName } = submission.value;

	const isNameTaken = await isUserNameTaken(userName);
	if (isNameTaken) {
		return submission.reply({ formErrors: ["This name is already taken."] });
	}

	try {
		const updatedUser = await updateUserName(currentUser.id, userName);
		const session = await getSession(request.headers.get("Cookie"));
		session.set("user", sanitizeUser(updatedUser));
		return redirect(`/${userName}`, {
			headers: {
				"Set-Cookie": await commitSession(session),
			},
		});
	} catch (error) {
		console.error("Error updating username:", error);
		return submission.reply({
			formErrors: ["An error occurred while updating your username."],
		});
	}
}

export default function Welcome() {
	const actionData = useActionData<typeof action>();

	const [form, { userName }] = useForm({
		id: "userName-form",
		constraint: getZodConstraint(schema),
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema });
		},
	});

	return (
		<div className="container mx-auto mt-10">
			<Card className="w-[350px] mx-auto">
				<CardHeader>
					<CardTitle className="flex items-center justify-center">
						Welcome to Evame
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Form method="post" {...getFormProps(form)}>
						<div className="mb-4 flex items-center">
							<p className="mr-2">Evame</p>
							<Input
								{...getInputProps(userName, { type: "text" })}
								placeholder="example"
								defaultValue={""}
							/>
						</div>
						<div
							id={userName.errorId}
							className="text-red-500 text-sm mt-2 text-center"
						>
							{userName.errors}
						</div>
						<p className="text-sm text-gray-500 mb-4">
							Clicking "Start" means you accept our{" "}
							<a href="/terms" className="text-blue-500 hover:underline">
								Terms
							</a>
							.
						</p>
						<Button type="submit" className="w-full">
							<div className="flex items-center justify-center">
								Start <ArrowRight className="h-4 w-4 ml-2" />
							</div>
						</Button>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { getZodConstraint } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useLocation } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { authenticator } from "../utils/auth.server";
import { GoogleForm } from "./resources+/google-form";

const loginSchema = z.object({
	email: z.string().email("有効なメールアドレスを入力してください"),
	password: z.string().min(4, "パスワードは4文字以上である必要があります"),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const currentUser = await authenticator.isAuthenticated(request, {
		successRedirect: "/",
	});
	return json({ currentUser });
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.clone().formData();
	const intent = String(formData.get("intent"));
	const submission = parseWithZod(formData, { schema: loginSchema });
	try {
		switch (intent) {
			case "SignIn":
				if (submission.status !== "success") {
					return submission.reply();
				}
				return authenticator.authenticate("user-pass", request, {
					successRedirect: "/",
				});
			case "SignInWithGoogle":
				return authenticator.authenticate("google", request, {
					successRedirect: "/",
					failureRedirect: "/auth/login",
				});
			default:
				return submission.reply({ formErrors: ["Invalid action"] });
		}
	} catch (error) {
		return submission.reply({ formErrors: [error as string] });
	}
};

const LoginPage = () => {
	const lastResult = useActionData<typeof action>();
	const location = useLocation();
	const [form, { email, password }] = useForm({
		id: "login-form",
		lastResult,
		constraint: getZodConstraint(loginSchema),
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: loginSchema });
		},
	});

	return (
		<div className="container mx-auto max-w-md py-8">
			<Card>
				<CardHeader>
					<CardTitle>Login</CardTitle>
				</CardHeader>
				<CardContent>
					<Form method="post" {...getFormProps(form)}>
						{form.errors && (
							<p className="text-red-500 text-center mt-2">invalid</p>
						)}
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor={email.id}>Email</Label>
								<Input {...getInputProps(email, { type: "email" })} />
								{email.errors && (
									<p className="text-sm text-red-500">{email.errors}</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor={password.id}>Password</Label>
								<Input {...getInputProps(password, { type: "password" })} />
								{password.errors && (
									<p className="text-sm text-red-500">{password.errors}</p>
								)}
							</div>
							<Button
								type="submit"
								name="intent"
								value="SignIn"
								className="w-full"
							>
								Login
							</Button>
						</div>
					</Form>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4">
					<Separator className="my-4" />
					<div className="text-center text-sm text-gray-500 my-2">
						Or continue with
					</div>
					<GoogleForm redirectTo={location.pathname + location.search} />
				</CardFooter>
			</Card>
		</div>
	);
};

export default LoginPage;

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";
import { Alert, AlertDescription } from "~/components/ui/alert";
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
import { GoogleForm } from "../components/GoogleForm";
import { authenticator } from "../utils/auth.server";

const loginSchema = z.object({
	email: z.string().email("有効なメールアドレスを入力してください"),
	password: z.string().min(4, "パスワードは4文字以上である必要があります"),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const safeUser = await authenticator.isAuthenticated(request, {
		successRedirect: "/",
	});
	return json({ safeUser });
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.clone().formData();
	const action = String(formData.get("_action"));
	const submission = parseWithZod(formData, { schema: loginSchema });
	try {
		switch (action) {
			case "SignIn":
				if (submission.status !== "success") {
					return json({ result: submission.reply() });
				}
				return authenticator.authenticate("user-pass", request, {
					successRedirect: "/",
					failureRedirect: "/auth/login",
				});
			case "SignInWithGoogle":
				return authenticator.authenticate("google", request, {
					successRedirect: "/",
					failureRedirect: "/auth/login",
				});
			default:
				return json({ result: { status: "error", message: "Invalid action" } });
		}
	} catch (error) {
		return json({ result: { status: "error", message: error } });
	}
};

const LoginPage = () => {
	const lastSubmission = useActionData<typeof action>();
	const [form, { email, password }] = useForm({
		id: "login-form",
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
						{lastSubmission?.result?.status === "error" && (
							<Alert variant="destructive" className="mb-4">
								<AlertDescription>
									{JSON.stringify(lastSubmission.result)}
								</AlertDescription>
							</Alert>
						)}
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor={email.id}>Email</Label>
								<Input {...getInputProps(email, { type: "email" })} />
								{email.errors && (
									<p className="text-sm text-red-500">e{email.errors}</p>
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
								name="_action"
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
					<GoogleForm />
					<p className="text-sm text-center mt-4">
						Don't have an account?{" "}
						<Link to="/auth/signup" className="text-blue-600 hover:underline">
							Sign Up
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
};

export default LoginPage;

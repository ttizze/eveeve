import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { GoogleForm } from "../components/GoogleForm";
import { authenticator } from "../utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const safeUser = await authenticator.isAuthenticated(request, {
		successRedirect: "/",
	});
	return json({ safeUser });
};

export const action = async ({ request }: ActionFunctionArgs) => {
	return authenticator.authenticate("google", request, {
		successRedirect: "/",
		failureRedirect: "/auth/login",
	});
};

const LoginPage = () => {
	return (
		<div className="container mx-auto max-w-md py-8">
			<Card>
				<CardHeader>
					<CardTitle>Login</CardTitle>
				</CardHeader>
				<CardContent>
					<GoogleForm />
				</CardContent>
			</Card>
		</div>
	);
};

export default LoginPage;

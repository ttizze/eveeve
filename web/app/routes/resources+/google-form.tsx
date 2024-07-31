import type { ActionFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "~/components/ui/button";
import { authenticator } from "~/utils/auth.server";

export async function action({ request }: ActionFunctionArgs) {
	return authenticator.authenticate("google", request, {
		successRedirect: "/api/auth/callback/google",
		failureRedirect: "/login",
	});
}

export function GoogleForm({ redirectTo }: { redirectTo: string }) {
	const fetcher = useFetcher();
	return (
		<fetcher.Form
			method="POST"
			action="/resources/google-form"
			className="w-full "
		>
			<input type="hidden" name="redirectTo" value={redirectTo} />
			<Button
				type="submit"
				name="intent"
				value="SignInWithGoogle"
				variant="secondary"
				className="w-full"
			>
				<FcGoogle className="mr-2 h-4 w-4" />
				Sign In with Google
			</Button>
		</fetcher.Form>
	);
}

import { FcGoogle } from "react-icons/fc";
import type { ActionFunctionArgs } from "react-router";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { authenticator } from "~/utils/auth.server";

export async function action({ request }: ActionFunctionArgs) {
	return authenticator.authenticate("google", request, {
		successRedirect: "/api/auth/callback/google",
		failureRedirect: "/",
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
				variant="outline"
				className="w-full rounded-full h-12 text-md"
			>
				<FcGoogle className="mr-2 h-6 w-6" />
				Google Login
			</Button>
		</fetcher.Form>
	);
}

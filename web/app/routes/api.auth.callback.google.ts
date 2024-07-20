import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "../utils/auth.server";

export const loader = ({ request }: LoaderFunctionArgs) => {
	try {
		return authenticator.authenticate("google", request, {
			successRedirect: "/translate",
			failureRedirect: "/",
		});
	} catch (error) {
		console.error("Google authentication error:", error);
		return new Response("Authentication failed", { status: 500 });
	}
};

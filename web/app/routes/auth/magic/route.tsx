import type { LoaderFunctionArgs } from "react-router";
import { authenticator } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
	await authenticator.authenticate("magicLink", request, {
		successRedirect: "/home",
		failureRedirect: "/auth/login",
	});
}

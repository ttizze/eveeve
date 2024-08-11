import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "../utils/auth.server";
import { redirect } from "@remix-run/node";
import { getSession, commitSession } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
	try {
		const user = await authenticator.authenticate("google", request, {
			failureRedirect: "/auth/login",
		});
		const session = await getSession(request.headers.get("Cookie"));
    session.set("user", user);

    // リダイレクト先を決定
    const redirectTo = user.userName.startsWith("new-user-") ? "/welcome" : `/${user.userName}`;

    // セッションをコミットしてリダイレクト
    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
	} catch (error) {
		console.error("Google authentication error:", error);
		return new Response("Authentication failed", { status: 500 });
	}
}

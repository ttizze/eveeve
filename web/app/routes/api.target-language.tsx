import { json } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { commitSession, getSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
	const session = await getSession(request.headers.get("Cookie"));
	return json({ targetLanguage: session.get("targetLanguage") || "ja" });
};

export const action: ActionFunction = async ({ request }) => {
	const session = await getSession(request.headers.get("Cookie"));
	const formData = await request.formData();
	const targetLanguage = formData.get("targetLanguage");

	if (typeof targetLanguage === "string") {
		session.set("targetLanguage", targetLanguage);
		return json(
			{ success: true },
			{
				headers: {
					"Set-Cookie": await commitSession(session),
				},
			},
		);
	}

	return json({ success: false }, { status: 400 });
};

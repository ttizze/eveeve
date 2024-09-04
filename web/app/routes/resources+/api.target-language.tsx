import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";

import { localeCookie } from "~/i18n.server";

export const action: ActionFunction = async ({ request }) => {
	const formData = await request.formData();
	const targetLanguage = formData.get("targetLanguage");

	if (typeof targetLanguage === "string") {
		const serializedCookie = await localeCookie.serialize(targetLanguage);

		return json(
			{ success: true },
			{
				headers: {
					"Set-Cookie": serializedCookie,
				},
			},
		);
	}

	return json({ success: false }, { status: 400 });
};

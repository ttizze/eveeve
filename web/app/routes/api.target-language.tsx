import { json } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
	buildTargetLanguageCookie,
	getTargetLanguage,
} from "~/utils/target-language.server";

export const loader: LoaderFunction = async ({ request }) => {
	const targetLanguage = await getTargetLanguage(request);
	return json({ targetLanguage });
};

export const action: ActionFunction = async ({ request }) => {
	const formData = await request.formData();
	const targetLanguage = formData.get("targetLanguage");

	if (typeof targetLanguage === "string") {
		const cookie = await buildTargetLanguageCookie(request, targetLanguage);
		return json({ success: true }, { headers: { "Set-Cookie": cookie } });
	}

	return json({ success: false }, { status: 400 });
};

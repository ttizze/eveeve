import { commitSession, getSession } from "~/utils/session.server";

export const getTargetLanguage = async (request: Request) => {
	const session = await getSession(request.headers.get("Cookie"));
	return session.get("targetLanguage") ?? "ja";
};

export const setTargetLanguage = async (
	request: Request,
	targetLanguage: string,
) => {
	const session = await getSession(request.headers.get("Cookie"));
	session.set("targetLanguage", targetLanguage);
	return {
		"Set-Cookie": await commitSession(session),
	};
};

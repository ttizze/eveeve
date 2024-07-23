import { commitSession, getSession } from "~/utils/session.server";

export const getTargetLanguage = async (request: Request) => {
	const session = await getSession(request.headers.get("Cookie"));
	const targetLanguage = session.get("targetLanguage") ?? "ja";
	return targetLanguage;
};

export const buildTargetLanguageCookie = async (
	request: Request,
	targetLanguage: string,
) => {
	const session = await getSession(request.headers.get("Cookie"));
	session.set("targetLanguage", targetLanguage);
	return await commitSession(session);
};

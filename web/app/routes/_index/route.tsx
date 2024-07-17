import { parseWithZod } from "@conform-to/zod";
import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/utils/auth.server";
import { validateGeminiApiKey } from "~/utils/gemini";
import { prisma } from "~/utils/prisma";
import { GoogleSignInAndGeminiApiKeyForm } from "./components/GoogleSignInAndGeminiApiKeyForm";
import { geminiApiKeySchema } from "./types";

export const meta: MetaFunction = () => {
	return [
		{ title: "EveEve" },
		{
			name: "description",
			content:
				"EveEveは、インターネット上のテキストを翻訳できるオープンソースプロジェクトです。",
		},
	];
};

export async function loader({ request }: LoaderFunctionArgs) {
	const safeUser = await authenticator.isAuthenticated(request);
	if (safeUser) {
		const dbUser = await prisma.user.findUnique({ where: { id: safeUser.id } });
		if (dbUser?.geminiApiKey) {
			return redirect("/translate");
		}
	}
	return json({ safeUser, hasGeminiApiKey: false });
}

export async function action({ request }: ActionFunctionArgs) {
	const clone = request.clone();
	const formData = await clone.formData();
	switch (formData.get("intent")) {
		case "SignInWithGoogle":
			return authenticator.authenticate("google", request, {
				successRedirect: "/",
				failureRedirect: "/",
			});

		case "saveGeminiApiKey": {
			const user = await authenticator.isAuthenticated(request, {
				failureRedirect: "/",
			});
			const submission = parseWithZod(formData, { schema: geminiApiKeySchema });
			if (submission.status !== "success") {
				return submission.reply();
			}
			const isValid = await validateGeminiApiKey(submission.value.geminiApiKey);
			if (!isValid) {
				return submission.reply({
					formErrors: ["Gemini API key validation failed"],
				});
			}
			await prisma.user.update({
				where: { id: user.id },
				data: { geminiApiKey: submission.value.geminiApiKey },
			});
			return redirect("/translate");
		}

		default:
			return null;
	}
}

export default function Index() {
	const { safeUser } = useLoaderData<typeof loader>();

	return (
		<div>
			<div className="container mx-auto max-w-2xl min-h-50 py-10">
				<h1 className="text-2xl font-bold text-center">
					Everyone Translate Everything
				</h1>
				<p className="text-sm text-gray-500 text-center">
					EveEveは、インターネット上のテキストを翻訳できるオープンソースプロジェクトです。
				</p>
				<GoogleSignInAndGeminiApiKeyForm
					isLoggedIn={!!safeUser}
					hasGeminiApiKey={false}
				/>
			</div>
		</div>
	);
}

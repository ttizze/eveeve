import { parseWithZod } from "@conform-to/zod";
import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { z } from "zod";
import { Header } from "~/components/Header";
import { authenticator } from "~/utils/auth.server";
import { getSession } from "~/utils/session.server";
import { extractNumberedElements } from "../../utils/extractNumberedElements";
import { prisma } from "../../utils/prisma";
import { GoogleSignInAndGeminiApiKeyForm } from "./components/GoogleSignInAndGeminiApiKeyForm";
import {
	URLTranslationForm,
	urlTranslationSchema,
} from "./components/URLTranslationForm";
import { addNumbersToContent } from "./utils/addNumbersToContent";
import { extractArticle } from "./utils/articleUtils";
import { fetchWithRetry } from "./utils/fetchWithRetry";
import { validateGeminiApiKey } from "./utils/gemini";
import { translate } from "./utils/translation";
import { geminiApiKeySchema } from "./types";
import type { UserReadHistoryItem } from "./types";

import { UserReadHistoryList } from "./components/UserReadHistoryList";

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
	const session = await getSession(request.headers.get("Cookie"));
	const targetLanguage = session.get("targetLanguage") || "ja";

	let hasGeminiApiKey = false;
	let userReadHistory: UserReadHistoryItem[] = [];
	if (safeUser) {
		const dbUser = await prisma.user.findUnique({ where: { id: safeUser.id } });
		hasGeminiApiKey = !!dbUser?.geminiApiKey;

		
    userReadHistory = await prisma.userReadHistory.findMany({
      where: { userId: safeUser.id },
      include: {
        pageVersion: {
          include: {
            page: true,
            pageVersionTranslationInfo: {
              where: { targetLanguage }
            }
          }
        }
      },
      orderBy: { readAt: 'desc' },
      take: 10
    });
  }

	return typedjson({ safeUser, targetLanguage, hasGeminiApiKey, userReadHistory });
}

export async function action({ request }: ActionFunctionArgs) {

	const formData = await request.clone().formData();
	switch (formData.get("intent")) {
		case "SignInWithGoogle":
			return authenticator.authenticate("google", request, {
				successRedirect: "/",
				failureRedirect: "/auth/login",
			});

		case "saveGeminiApiKey": {
			const safeUser = await authenticator.isAuthenticated(request);
			if (!safeUser) {
				return redirect("/auth/login");
			}
			const submission = parseWithZod(formData, { schema: geminiApiKeySchema });
			if (submission.status !== "success") {
				return submission.reply();
			}
			const geminiApiKey = formData.get("geminiApiKey") as string;
			const isValid = await validateGeminiApiKey(geminiApiKey);
			if (!isValid) {
				return submission.reply({
					formErrors: ["Gemini API key validation failed"],
				});
			}
			await prisma.user.update({
				where: { id: safeUser.id },
				data: { geminiApiKey: submission.value.geminiApiKey },
			});
			return submission.reply();
		}

		case "translateUrl": {
			const safeUser = await authenticator.isAuthenticated(request);
			if (!safeUser) {
				return redirect("/auth/login");
			}
			const submission = parseWithZod(formData, {
				schema: urlTranslationSchema,
			});
			if (submission.status !== "success") {
				return submission.reply();
			}
			const dbUser = await prisma.user.findUnique({ where: { id: safeUser.id } });
			const geminiApiKey = dbUser?.geminiApiKey;
			if (!geminiApiKey) {
				return submission.reply({
					formErrors: ["Gemini API key is not set"],
				});
			}
			const html = await fetchWithRetry(submission.value.url);
			const { content, title } = extractArticle(html);
			const numberedContent = addNumbersToContent(content);
			const extractedNumberedElements =
				extractNumberedElements(numberedContent);
			const session = await getSession(request.headers.get("Cookie"));
			const targetLanguage = session.get("targetLanguage") || "ja";
			await translate(
				geminiApiKey,
				safeUser.id,
				targetLanguage,
				title,
				numberedContent,
				extractedNumberedElements,
				submission.value.url,
			);
			return submission.reply();
		}
	}
}
export default function Index() {
  const { safeUser, targetLanguage, hasGeminiApiKey, userReadHistory } =
    useTypedLoaderData<typeof loader>();


	return (
		<div>
			<Header safeUser={safeUser} targetLanguage={targetLanguage} />
			<div className="container mx-auto max-w-2xl min-h-50 py-10">
				<div className="relative">
					<div
						className={`${!safeUser || !hasGeminiApiKey ? "opacity-30 pointer-events-none" : ""}`}
					>
						<URLTranslationForm />
					</div>
					{(!safeUser || !hasGeminiApiKey) && (
						<div className="absolute inset-0 flex items-center justify-center  bg-opacity-70">
							<div className="w-full max-w-md">
								<GoogleSignInAndGeminiApiKeyForm
									isLoggedIn={!!safeUser}
									hasGeminiApiKey={hasGeminiApiKey}
								/>
							</div>
						</div>
					)}
					{safeUser && hasGeminiApiKey && (
          <div className="mt-8">
            <UserReadHistoryList userReadHistory={userReadHistory} />
          </div>
        )}
				</div>
			</div>
		</div>
	);
}

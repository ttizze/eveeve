import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useRevalidator } from "@remix-run/react";
import { useEffect } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { z } from "zod";
import { Header } from "~/components/Header";
import { authenticator } from "~/utils/auth.server";
import { validateGeminiApiKey } from "~/utils/gemini";
import { prisma } from "~/utils/prisma";
import { getSession } from "~/utils/session.server";
import { translate } from "../../feature/translate/libs/translation";
import { addNumbersToContent } from "../../feature/translate/utils/addNumbersToContent";
import { extractArticle } from "../../feature/translate/utils/extractArticle";
import { extractNumberedElements } from "../../feature/translate/utils/extractNumberedElements";
import { fetchWithRetry } from "../../feature/translate/utils/fetchWithRetry";
import { GeminiApiKeyForm } from "./components/GeminiApiKeyForm";
import {
	URLTranslationForm,
	urlTranslationSchema,
} from "./components/URLTranslationForm";
import { UserAITranslationStatus } from "./components/UserAITranslationStatus";
import {
	type UserAITranslationInfoItem,
	UserAITranslationInfoSchema,
} from "./types";
import { geminiApiKeySchema } from "./types";

export async function loader({ request }: LoaderFunctionArgs) {
	const safeUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/",
	});
	let hasGeminiApiKey = false;
	const dbUser = await prisma.user.findUnique({ where: { id: safeUser.id } });
	if (dbUser?.geminiApiKey) {
		hasGeminiApiKey = true;
	}

	const session = await getSession(request.headers.get("Cookie"));
	const targetLanguage = session.get("targetLanguage") || "ja";
	let userAITranslationInfo: UserAITranslationInfoItem[] = [];
	const rawTranslationInfo = await prisma.userAITranslationInfo.findMany({
		where: {
			userId: safeUser.id,
			targetLanguage,
		},
		include: {
			pageVersion: {
				select: {
					title: true,
					page: {
						select: {
							url: true,
						},
					},
					pageVersionTranslationInfo: {
						where: {
							targetLanguage,
						},
					},
				},
			},
		},
		orderBy: {
			lastTranslatedAt: "desc",
		},
		take: 10,
	});

	userAITranslationInfo = z
		.array(UserAITranslationInfoSchema)
		.parse(rawTranslationInfo);

	return typedjson({
		safeUser,
		targetLanguage,
		userAITranslationInfo,
		hasGeminiApiKey,
	});
}

export async function action({ request }: ActionFunctionArgs) {
	const safeUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/",
	});
	const clone = request.clone();
	const formData = await clone.formData();
	console.log(formData);
	switch (formData.get("intent")) {
		case "saveGeminiApiKey": {
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
				where: { id: safeUser.id },
				data: { geminiApiKey: submission.value.geminiApiKey },
			});
			return redirect("/translate");
		}
		case "translateUrl": {
			const submission = parseWithZod(formData, {
				schema: urlTranslationSchema,
			});
			if (submission.status !== "success") {
				return submission.reply();
			}
			const dbUser = await prisma.user.findUnique({
				where: { id: safeUser.id },
			});
			if (!dbUser?.geminiApiKey) {
				return submission.reply({ formErrors: ["Gemini API key is not set"] });
			}

			const html = await fetchWithRetry(submission.value.url);
			const { content, title } = extractArticle(html, submission.value.url);
			const numberedContent = addNumbersToContent(content);
			const extractedNumberedElements = extractNumberedElements(
				numberedContent,
				title,
			);
			const session = await getSession(request.headers.get("Cookie"));
			const targetLanguage = session.get("targetLanguage") || "ja";

			await translate(
				dbUser.geminiApiKey,
				safeUser.id,
				targetLanguage,
				title,
				numberedContent,
				extractedNumberedElements,
				submission.value.url,
			);

			return submission.reply();
		}
		default: {
			return json({ error: "Invalid intent" });
		}
	}
}

export default function TranslatePage() {
	const { safeUser, targetLanguage, userAITranslationInfo, hasGeminiApiKey } =
		useTypedLoaderData<typeof loader>();
	const revalidator = useRevalidator();

	useEffect(() => {
		const intervalId = setInterval(() => {
			revalidator.revalidate();
		}, 5000);

		return () => clearInterval(intervalId);
	}, [revalidator]);
	return (
		<div>
			<Header safeUser={safeUser} />
			<div className="container mx-auto max-w-2xl min-h-50 py-10">
				<div className="pb-4">
					{safeUser && hasGeminiApiKey && <URLTranslationForm />}
					{safeUser && !hasGeminiApiKey && <GeminiApiKeyForm />}
				</div>
				<div>
					<h2 className="text-2xl font-bold">Translation history</h2>
					<div>
						<UserAITranslationStatus
							userAITranslationInfo={userAITranslationInfo}
							targetLanguage={targetLanguage}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

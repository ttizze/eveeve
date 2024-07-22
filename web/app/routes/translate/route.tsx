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
import { prisma } from "~/utils/prisma";
import { getSession } from "~/utils/session.server";
import { translateJob } from "./translate-job.server";
import { validateGeminiApiKey } from "../../feature/translate/utils/gemini";
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

	const intent = String(formData.get("intent"));
	switch (intent) {
		case "saveGeminiApiKey": {
			const submission = parseWithZod(formData, { schema: geminiApiKeySchema });
			if (submission.status !== "success") {
				return { intent, lastResult: submission.reply() };
			}
			const isValid = await validateGeminiApiKey(submission.value.geminiApiKey);
			if (!isValid) {
				return {
					intent,
					lastResult: submission.reply({
						formErrors: ["Gemini API key validation failed"],
					}),
				};
			}
			await prisma.user.update({
				where: { id: safeUser.id },
				data: { geminiApiKey: submission.value.geminiApiKey },
			});
			return { intent, lastResult: submission.reply({ resetForm: true }) };
		}
		case "translateUrl": {
			const submission = parseWithZod(formData, {
				schema: urlTranslationSchema,
			});
			if (submission.status !== "success") {
				return {
					intent,
					lastResult: submission.reply(),
					url: null,
				};
			}
			const dbUser = await prisma.user.findUnique({
				where: { id: safeUser.id },
			});
			if (!dbUser?.geminiApiKey) {
				return {
					intent,
					lastResult: submission.reply({
						formErrors: ["Gemini API key is not set"],
					}),
					url: null,
				};
			}
			const session = await getSession(request.headers.get("Cookie"));
			// Start the translation job in background
			translateJob({
				url: submission.value.url,
				targetLanguage: session.get("targetLanguage") || "ja",
				apiKey: dbUser.geminiApiKey,
				userId: safeUser.id,
			});

			return {
				intent,
				lastResult: submission.reply({ resetForm: true }),
				url: submission.value.url,
			};
		}
		default: {
			throw new Error("Invalid Intent");
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

import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useRevalidator } from "@remix-run/react";
import { useEffect } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Header } from "~/components/Header";
import { validateGeminiApiKey } from "~/feature/translate/utils/gemini";
import { authenticator } from "~/utils/auth.server";
import { getTargetLanguage } from "~/utils/target-language.server";
import { GeminiApiKeyForm } from "./components/GeminiApiKeyForm";
import { URLTranslationForm } from "./components/URLTranslationForm";
import { UserAITranslationStatus } from "./components/UserAITranslationStatus";
import { updateGeminiApiKey } from "./functions/mutations.server";
import {
	getDbUser,
	listUserAiTransationInfo,
} from "./functions/queries.server";
import { translateJob } from "./functions/translate-job.server";
import { schema } from "./types";

export async function loader({ request }: LoaderFunctionArgs) {
	const safeUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/",
	});

	const dbUser = await getDbUser(safeUser.id);
	const hasGeminiApiKey = !!dbUser?.geminiApiKey;
	const targetLanguage = await getTargetLanguage(request);
	const userAITranslationInfo = await listUserAiTransationInfo(
		safeUser.id,
		targetLanguage,
	);

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
	const submission = parseWithZod(await request.formData(), { schema });
	if (submission.status !== "success") {
		return { intent: null, lastResult: submission.reply() };
	}
	const intent = submission.value.intent;

	switch (submission.value.intent) {
		case "saveGeminiApiKey": {
			const isValid = await validateGeminiApiKey(submission.value.geminiApiKey);
			if (!isValid) {
				return {
					intent,
					lastResult: submission.reply({
						formErrors: ["Gemini API key validation failed"],
					}),
				};
			}
			await updateGeminiApiKey(safeUser.id, submission.value.geminiApiKey);
			return { intent, lastResult: submission.reply({ resetForm: true }) };
		}
		case "translateUrl": {
			const dbUser = await getDbUser(safeUser.id);
			if (!dbUser?.geminiApiKey) {
				return {
					intent,
					lastResult: submission.reply({
						formErrors: ["Gemini API key is not set"],
					}),
					url: null,
				};
			}
			const targetLanguage = await getTargetLanguage(request);
			// Start the translation job in background
			translateJob({
				url: submission.value.url,
				targetLanguage,
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
					{hasGeminiApiKey && <URLTranslationForm />}
					{!hasGeminiApiKey && <GeminiApiKeyForm />}
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

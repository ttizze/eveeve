import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useRevalidator } from "@remix-run/react";
import { useEffect } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Header } from "~/components/Header";
import { getTranslateUserQueue } from "~/feature/translate/translate-user-queue";
import { authenticator } from "~/utils/auth.server";
import { normalizeAndSanitizeUrl } from "~/utils/normalize-and-sanitize-url.server";
import { getTargetLanguage } from "~/utils/target-language.server";
import { GeminiApiKeyForm } from "../resources+/gemini-api-key-form";
import { URLTranslationForm } from "./components/URLTranslationForm";
import { UserAITranslationStatus } from "./components/UserAITranslationStatus";
import {
	getDbUser,
	listUserAiTranslationInfo,
} from "./functions/queries.server";
import { urlTranslationSchema } from "./types";

export async function loader({ request }: LoaderFunctionArgs) {
	const safeUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/",
	});

	const dbUser = await getDbUser(safeUser.id);
	const hasGeminiApiKey = !!dbUser?.geminiApiKey;
	const targetLanguage = await getTargetLanguage(request);
	const userAITranslationInfo = await listUserAiTranslationInfo(
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
	const submission = parseWithZod(await request.formData(), {
		schema: urlTranslationSchema,
	});
	if (submission.status !== "success") {
		return { lastResult: submission.reply() };
	}

	const dbUser = await getDbUser(safeUser.id);
	if (!dbUser?.geminiApiKey) {
		return {
			lastResult: submission.reply({
				formErrors: ["Gemini API key is not set"],
			}),
			url: null,
		};
	}

	const targetLanguage = await getTargetLanguage(request);
	const normalizedUrl = normalizeAndSanitizeUrl(submission.value.url);
	// Start the translation job in background
	const queue = getTranslateUserQueue(safeUser.id);
	const job = await queue.add(`translate-${safeUser.id}`, {
		url: normalizedUrl,
		targetLanguage,
		apiKey: dbUser.geminiApiKey,
		userId: safeUser.id,
	});
	console.log(job.toJSON());

	return {
		lastResult: submission.reply({ resetForm: true }),
		url: normalizedUrl,
	};
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

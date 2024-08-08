import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useRevalidator } from "@remix-run/react";
import { useEffect } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Header } from "~/components/Header";
import { addNumbersToContent } from "~/features/prepare-html-for-translate/utils/addNumbersToContent";
import { extractArticle } from "~/features/prepare-html-for-translate/utils/extractArticle";
import { extractNumberedElements } from "~/features/prepare-html-for-translate/utils/extractNumberedElements";
import { fetchWithRetry } from "~/features/prepare-html-for-translate/utils/fetchWithRetry";
import { getTranslateUserQueue } from "~/features/translate/translate-user-queue";
import { authenticator } from "~/utils/auth.server";
import { normalizeAndSanitizeUrl } from "~/utils/normalize-and-sanitize-url.server";
import { getTargetLanguage } from "~/utils/target-language.server";
import { GeminiApiKeyForm } from "../resources+/gemini-api-key-form";
import { TranslationInputForm } from "./components/TranslationInputForm";
import { UserAITranslationStatus } from "./components/UserAITranslationStatus";
import { getOrCreateUserAITranslationInfo } from "./functions/mutations.server";
import { getDbUser } from "./functions/queries.server";
import { listUserAiTranslationInfo } from "./functions/queries.server";
import { translationInputSchema } from "./types";
import { generateSlug } from "./utils/generate-slug.server";

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

	const contentType = request.headers.get("Content-Type") || "";
	let formData: FormData;
	let html: string;
	let sourceUrl: string | null = null;
	let slug: string;

	formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema: translationInputSchema,
	});

	if (submission.status !== "success") {
		return { lastResult: submission.reply() };
	}

	let fileInfo: { name: string; size: number } | null = null;

	if (contentType.includes("multipart/form-data")) {
		const file = formData.get("file") as File;
		html = await file.text();
		slug = await generateSlug(file.name);
		fileInfo = { name: file.name, size: file.size };
	} else {
		sourceUrl = normalizeAndSanitizeUrl(submission.value.url || "");
		html = await fetchWithRetry(sourceUrl);
		slug = await generateSlug(sourceUrl);
	}
	const dbUser = await getDbUser(safeUser.id);
	if (!dbUser?.geminiApiKey) {
		return {
			lastResult: submission.reply({
				formErrors: ["Gemini API key is not set"],
			}),
			slug: null,
		};
	}
	const targetLanguage = await getTargetLanguage(request);

	await getOrCreateUserAITranslationInfo(dbUser.id, slug, targetLanguage);

	const { content, title } = extractArticle(html, sourceUrl);
	const numberedContent = addNumbersToContent(content);
	const numberedElements = extractNumberedElements(numberedContent);
	// Start the translation job in background
	const queue = getTranslateUserQueue(safeUser.id);
	const job = await queue.add(`translate-${safeUser.id}`, {
		geminiApiKey: dbUser.geminiApiKey,
		aiModel: submission.value.aiModel,
		userId: safeUser.id,
		targetLanguage,
		title,
		numberedContent,
		numberedElements,
		sourceUrl,
		slug,
	});

	return {
		lastResult: submission.reply({ resetForm: true }),
		slug,
		fileInfo,
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
					{hasGeminiApiKey ? <TranslationInputForm /> : <GeminiApiKeyForm />}
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

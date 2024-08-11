import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { useNavigation } from "@remix-run/react";
import { Form } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { Languages } from "lucide-react";
import { useState } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Header } from "~/components/Header";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Button } from "~/components/ui/button";
import { extractNumberedElements } from "~/features/prepare-html-for-translate/utils/extractNumberedElements";
import { AIModelSelector } from "~/features/translate/components/AIModelSelector";
import { getTranslateUserQueue } from "~/features/translate/translate-user-queue";
import { authenticator } from "~/utils/auth.server";
import { getTargetLanguage } from "~/utils/target-language.server";
import { ContentWithTranslations } from "./components/ContentWithTranslations";
import TargetLanguageSelector from "./components/TargetLanguageSelector";
import {
	handleAddTranslationAction,
	handleVoteAction,
} from "./functions/mutations.server";
import { getOrCreateUserAITranslationInfo } from "./functions/mutations.server";
import {
	fetchPage,
	fetchPageWithTranslations,
	getDbUser,
} from "./functions/queries.server";
import { actionSchema } from "./types";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const { slug } = params;

	if (!slug) {
		throw new Response("Missing URL parameter", { status: 400 });
	}

	const safeUser = await authenticator.isAuthenticated(request);
	const safeUserId = safeUser?.id;
	const targetLanguage = await getTargetLanguage(request);
	const pageData = await fetchPageWithTranslations(
		slug,
		safeUserId ?? 0,
		targetLanguage,
	);

	if (!pageData) {
		throw new Response("Failed to fetch article", { status: 500 });
	}

	return typedjson({ targetLanguage, pageData, safeUser });
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const safeUser = await authenticator.isAuthenticated(request);
	const safeUserId = safeUser?.id;
	const targetLanguage = await getTargetLanguage(request);

	const submission = parseWithZod(await request.formData(), {
		schema: actionSchema,
	});
	console.log(submission);
	if (!safeUserId) {
		return {
			intent: null,
			lastResult: submission.reply({ formErrors: ["User not authenticated"] }),
		};
	}
	if (submission.status !== "success") {
		return { intent: null, lastResult: submission.reply() };
	}
	const { intent } = submission.value;
	switch (intent) {
		case "vote":
			handleVoteAction(
				submission.value.translateTextId,
				submission.value.isUpvote,
				safeUserId,
			);
			return { intent, lastResult: submission.reply({ resetForm: true }) };
		case "add":
			handleAddTranslationAction(
				submission.value.sourceTextId,
				submission.value.text,
				safeUserId,
				targetLanguage,
			);
			return { intent, lastResult: submission.reply({ resetForm: true }) };
		case "translate": {
			const dbUser = await getDbUser(safeUser.id);
			if (!dbUser?.geminiApiKey) {
				return {
					lastResult: submission.reply({
						formErrors: ["Gemini API key is not set"],
					}),
					slug: null,
				};
			}
			const page = await fetchPage(submission.value.pageId);
			if (!page) {
				return {
					lastResult: submission.reply({
						formErrors: ["Page not found"],
					}),
					slug: null,
				};
			}
			await getOrCreateUserAITranslationInfo(
				dbUser.id,
				page.slug,
				targetLanguage,
			);

			const numberedElements = extractNumberedElements(page.content);
			const queue = getTranslateUserQueue(safeUser.id);
			const job = await queue.add(`translate-${safeUser.id}`, {
				geminiApiKey: dbUser.geminiApiKey,
				aiModel: submission.value.aiModel,
				userId: safeUser.id,
				pageId: page.id,
				targetLanguage,
				title: page.title,
				numberedContent: page.content,
				numberedElements,
				slug: page.slug,
			});
			return { intent, lastResult: submission.reply({ resetForm: true }) };
		}
		default:
			throw new Error("Invalid Intent");
	}
};

export default function ReaderView() {
	const { pageData, safeUser } = useTypedLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
	const navigation = useNavigation();
	const [form, fields] = useForm({
		lastResult: actionData?.lastResult,
	});

	if (!pageData) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<Header safeUser={safeUser} />
			<div className="container px-4 py-8  sm:max-w-prose lg:max-w-2xl xl:max-w-3xl mx-auto">
				<div className="flex justify-between items-center mb-8 ">
					<div className="flex items-center justify-center">
						<TargetLanguageSelector />
						<Form method="post">
							<div className="w-60 flex items-center">
								<AIModelSelector onModelSelect={setSelectedModel} />
								<input type="hidden" name="pageId" value={pageData.id} />
								<input type="hidden" name="aiModel" value={selectedModel} />
								<Button
									type="submit"
									name="intent"
									value="translate"
									className="w-23"
									disabled={navigation.state === "submitting"}
								>
									{navigation.state === "submitting" ? (
										<LoadingSpinner />
									) : (
										<div className="flex items-center">
											<Languages className="w-4 h-4 mr-1" />
											<p>Translate</p>
										</div>
									)}
								</Button>
							</div>
						</Form>
					</div>
					{pageData.userId === safeUser?.id && (
						<Button asChild variant="outline">
							<Link to={`/${safeUser.id}/page/${pageData.slug}/edit`}>
								Edit
							</Link>
						</Button>
					)}
				</div>
				<article className="prose dark:prose-invert lg:prose-xl">
					<h1>
						{pageData.title}
						<div>{pageData.translationTitle}</div>
					</h1>
					<hr />
					<ContentWithTranslations
						content={pageData.content}
						sourceTextWithTranslations={pageData.sourceTextWithTranslations}
						userId={safeUser?.id ?? null}
					/>
				</article>
			</div>
		</div>
	);
}

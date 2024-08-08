import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useNavigation } from "@remix-run/react";
import { Form } from "@remix-run/react";
import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Header } from "~/components/Header";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Button } from "~/components/ui/button";
import { extractNumberedElements } from "~/features/prepare-html-for-translate/utils/extractNumberedElements";
import { AIModelSelector } from "~/features/translate/components/AIModelSelector";
import { getTranslateUserQueue } from "~/features/translate/translate-user-queue";
import { getTargetLanguage } from "~/utils/target-language.server";
import { authenticator } from "../../utils/auth.server";
import { ContentWithTranslations } from "./components/ContentWithTranslations";
import {
	handleAddTranslationAction,
	handleVoteAction,
} from "./functions/mutations.server";
import {
	fetchLatestPageWithTranslations,
	fetchPage,
} from "./functions/queries.server";
import { getDbUser } from "./functions/queries.server";
import { actionSchema } from "./types";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const { slug } = params;

	if (!slug) {
		throw new Response("Missing URL parameter", { status: 400 });
	}

	const safeUser = await authenticator.isAuthenticated(request);
	const safeUserId = safeUser?.id;
	const targetLanguage = await getTargetLanguage(request);
	const pageData = await fetchLatestPageWithTranslations(
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
		case "retranslate": {
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
			const numberedElements = extractNumberedElements(page.content);
			const queue = getTranslateUserQueue(safeUser.id);
			const job = await queue.add(`translate-${safeUser.id}`, {
				geminiApiKey: dbUser.geminiApiKey,
				aiModel: submission.value.aiModel,
				userId: safeUser.id,
				targetLanguage,
				title: page.title,
				numberedContent: page.content,
				numberedElements,
				sourceUrl: page.sourceUrl,
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
	const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
	const navigation = useNavigation();

	if (!pageData) {
		return <div>Loading...</div>;
	}

	const sourceUrl = pageData.sourceUrl;

	return (
		<div>
			<Header safeUser={safeUser} />
			<div className="container mx-auto px-4 py-8">
				<div className="flex justify-center items-center mb-8">
					<Form method="post">
						<div className="w-60 flex items-center">
							<AIModelSelector onModelSelect={setSelectedModel} />
							<input type="hidden" name="pageId" value={pageData.id} />
							<input type="hidden" name="aiModel" value={selectedModel} />
							<Button
								type="submit"
								name="intent"
								value="retranslate"
								className="w-20"
								disabled={navigation.state === "submitting"}
							>
								{navigation.state === "submitting" ? (
									<LoadingSpinner />
								) : (
									<div className="flex items-center">
										<RotateCcw className="w-4 h-4 mr-1" />
										<p>Retry</p>
									</div>
								)}
							</Button>
						</div>
					</Form>
				</div>
				<article className="prose dark:prose-invert lg:prose-xl mx-auto">
					<h1>{pageData.title}</h1>
					{sourceUrl && (
						<p>
							<a
								href={sourceUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-500 hover:underline"
							>
								Original Article
							</a>
						</p>
					)}
					<hr />
					<ContentWithTranslations
						content={pageData.content}
						sourceTextWithTranslations={pageData.sourceTextWithTranslations}
						userId={safeUser?.id ?? null}
					/>
					<p>license: {pageData.license}</p>
				</article>
			</div>
		</div>
	);
}

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
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { AIModelSelector } from "~/features/translate/components/AIModelSelector";
import { getTranslateUserQueue } from "~/features/translate/translate-user-queue";
import { GeminiApiKeyDialog } from "~/routes/resources+/gemini-api-key-dialog";
import { authenticator } from "~/utils/auth.server";
import { getTargetLanguage } from "~/utils/target-language.server";
import { ContentWithTranslations } from "./components/ContentWithTranslations";
import TargetLanguageSelector from "./components/TargetLanguageSelector";
import { UserAITranslationStatus } from "./components/UserAITranslationStatus";
import {
	handleAddTranslationAction,
	handleVoteAction,
} from "./functions/mutations.server";
import { createUserAITranslationInfo } from "./functions/mutations.server";
import {
	fetchPage,
	fetchPageWithTranslations,
	fetchUserAITranslationInfo,
	getDbUser,
} from "./functions/queries.server";
import { actionSchema } from "./types";
import { extractNumberedElements } from "./utils/extractNumberedElements";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const { slug } = params;

	if (!slug) {
		throw new Response("Missing URL parameter", { status: 400 });
	}

	const safeUser = await authenticator.isAuthenticated(request);
	const safeUserId = safeUser?.id;
	const dbUser = await getDbUser(safeUserId ?? 0);
	const hasGeminiApiKey = !!dbUser?.geminiApiKey;
	const targetLanguage = await getTargetLanguage(request);
	const pageData = await fetchPageWithTranslations(
		slug,
		safeUserId ?? 0,
		targetLanguage,
	);

	if (!pageData) {
		throw new Response("Failed to fetch article", { status: 500 });
	}
	const userAITranslationInfo = await fetchUserAITranslationInfo(
		pageData.id,
		safeUserId ?? 0,
	);
	return typedjson({
		targetLanguage,
		pageData,
		safeUser,
		hasGeminiApiKey,
		userAITranslationInfo,
	});
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
			slug: null,
		};
	}
	if (submission.status !== "success") {
		return { intent: null, lastResult: submission.reply(), slug: null };
	}
	const { intent } = submission.value;
	switch (intent) {
		case "vote":
			handleVoteAction(
				submission.value.translateTextId,
				submission.value.isUpvote,
				safeUserId,
			);
			return {
				intent,
				lastResult: submission.reply({ resetForm: true }),
				slug: null,
			};
		case "add":
			handleAddTranslationAction(
				submission.value.sourceTextId,
				submission.value.text,
				safeUserId,
				targetLanguage,
			);
			return {
				intent,
				lastResult: submission.reply({ resetForm: true }),
				slug: null,
			};
		case "translate": {
			const dbUser = await getDbUser(safeUser.id);
			if (!dbUser?.geminiApiKey) {
				return {
					lastResult: submission.reply({
						formErrors: ["Gemini API key is not set"],
					}),
					intent: null,
					slug: null,
				};
			}
			const page = await fetchPage(submission.value.pageId);
			if (!page) {
				return {
					lastResult: submission.reply({
						formErrors: ["Page not found"],
					}),
					intent: null,
					slug: null,
				};
			}
			const userAITranslationInfo = await createUserAITranslationInfo(
				dbUser.id,
				page.id,
				submission.value.aiModel,
				targetLanguage,
			);

			const numberedElements = extractNumberedElements(
				page.content,
				page.title,
			);
			const queue = getTranslateUserQueue(safeUser.id);
			const job = await queue.add(`translate-${safeUser.id}`, {
				userAITranslationInfoId: userAITranslationInfo.id,
				geminiApiKey: dbUser.geminiApiKey,
				aiModel: submission.value.aiModel,
				userId: safeUser.id,
				pageId: page.id,
				targetLanguage,
				title: page.title,
				numberedContent: page.content,
				numberedElements,
			});
			return {
				intent,
				lastResult: submission.reply({ resetForm: true }),
				slug: page.slug,
			};
		}
		default:
			throw new Error("Invalid Intent");
	}
};

export default function ReaderView() {
	const { pageData, safeUser, hasGeminiApiKey, userAITranslationInfo } =
		useTypedLoaderData<typeof loader>();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
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
		<div className="container px-4 py-8  sm:max-w-prose lg:max-w-2xl xl:max-w-3xl mx-auto">
			<div className="flex justify-end items-center mb-8">
				{pageData.userId === safeUser?.id && safeUser && (
					<Button asChild variant="outline">
						<Link to={`/${safeUser.userName}/page/${pageData.slug}/edit`}>
							Edit
						</Link>
					</Button>
				)}
			</div>
			<div className="mb-8">
				<Form method="post">
					<div className="flex items-center space-x-2">
						<TargetLanguageSelector />
						<AIModelSelector onModelSelect={setSelectedModel} />
						<input type="hidden" name="pageId" value={pageData.id} />
						<input type="hidden" name="aiModel" value={selectedModel} />
						{hasGeminiApiKey ? (
							<Button
								type="submit"
								name="intent"
								value="translate"
								className="w-full"
								disabled={navigation.state === "submitting"}
							>
								{navigation.state === "submitting" ? (
									<LoadingSpinner />
								) : (
									<div className="flex items-center justify-center w-full">
										<Languages className="w-4 h-4 mr-1" />
										<p>Add Translation</p>
									</div>
								)}
							</Button>
						) : (
							<Button onClick={() => setIsDialogOpen(true)}>
								<div className="flex items-center justify-center w-full">
									<Languages className="w-4 h-4 mr-1" />
									<p>Add Translation</p>
								</div>
							</Button>
						)}
					</div>
				</Form>
				{actionData?.slug && (
					<Alert className="bg-blue-50 border-blue-200 text-blue-800 animate-in fade-in duration-300">
						<AlertTitle className="text-center">
							Translation Job Started
						</AlertTitle>
						<AlertDescription className="text-center">
							<strong className="font-semibold ">{actionData.slug}</strong>
						</AlertDescription>
					</Alert>
				)}
				<UserAITranslationStatus
					userAITranslationInfo={userAITranslationInfo}
				/>
			</div>
			<article className="prose dark:prose-invert lg:prose-xl">
				<ContentWithTranslations
					title={pageData.title}
					content={pageData.content}
					sourceTextWithTranslations={pageData.sourceTextWithTranslations}
					userId={safeUser?.id ?? null}
				/>
			</article>
			<GeminiApiKeyDialog
				isOpen={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			/>
		</div>
	);
}

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
import { getNonSanitizedUserbyUserName } from "~/routes/functions/queries.server";
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
} from "./functions/queries.server";
import { actionSchema } from "./types";
import { extractNumberedElements } from "./utils/extractNumberedElements";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const { slug } = params;

	if (!slug) {
		throw new Response("Missing URL parameter", { status: 400 });
	}

	const currentUser = await authenticator.isAuthenticated(request);
	const nonSanitizedUser = await getNonSanitizedUserbyUserName(
		currentUser?.userName ?? "",
	);
	const hasGeminiApiKey = !!nonSanitizedUser?.geminiApiKey;
	const targetLanguage = await getTargetLanguage(request);
	const pagWithTranslations = await fetchPageWithTranslations(
		slug,
		nonSanitizedUser?.id ?? 0,
		targetLanguage,
	);

	if (!pagWithTranslations) {
		throw new Response("Failed to fetch article", { status: 500 });
	}
	const userAITranslationInfo = await fetchUserAITranslationInfo(
		pagWithTranslations.id,
		nonSanitizedUser?.id ?? 0,
	);
	return typedjson({
		targetLanguage,
		pagWithTranslations,
		currentUser,
		hasGeminiApiKey,
		userAITranslationInfo,
	});
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const currentUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/auth/login",
	});
	const submission = parseWithZod(await request.formData(), {
		schema: actionSchema,
	});
	const nonSanitizedUser = await getNonSanitizedUserbyUserName(
		currentUser.userName,
	);
	if (!nonSanitizedUser) {
		throw new Response("User not found", { status: 404 });
	}
	const targetLanguage = await getTargetLanguage(request);

	if (submission.status !== "success") {
		return { intent: null, lastResult: submission.reply(), slug: null };
	}
	const { intent } = submission.value;
	switch (intent) {
		case "vote":
			handleVoteAction(
				submission.value.translateTextId,
				submission.value.isUpvote,
				nonSanitizedUser.id,
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
				nonSanitizedUser.id,
				targetLanguage,
			);
			return {
				intent,
				lastResult: submission.reply({ resetForm: true }),
				slug: null,
			};
		case "translate": {
			if (!nonSanitizedUser?.geminiApiKey) {
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
				nonSanitizedUser.id,
				page.id,
				submission.value.aiModel,
				targetLanguage,
			);

			const numberedElements = extractNumberedElements(
				page.content,
				page.title,
			);
			const queue = getTranslateUserQueue(nonSanitizedUser.id);
			const job = await queue.add(`translate-${nonSanitizedUser.id}`, {
				userAITranslationInfoId: userAITranslationInfo.id,
				geminiApiKey: nonSanitizedUser.geminiApiKey,
				aiModel: submission.value.aiModel,
				userId: nonSanitizedUser.id,
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
	const {
		pagWithTranslations,
		currentUser,
		hasGeminiApiKey,
		userAITranslationInfo,
	} = useTypedLoaderData<typeof loader>();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const actionData = useActionData<typeof action>();
	const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
	const navigation = useNavigation();
	const [form, fields] = useForm({
		lastResult: actionData?.lastResult,
	});

	if (!pagWithTranslations) {
		return <div>Loading...</div>;
	}

	return (
		<div className=" w-full max-w-3xl  mx-auto">
			<div className="flex justify-end items-center mb-8">
				{pagWithTranslations.user.userName === currentUser?.userName &&
					currentUser && (
						<Button asChild variant="outline">
							<Link
								to={`/${currentUser.userName}/page/${pagWithTranslations.slug}/edit`}
							>
								Edit
							</Link>
						</Button>
					)}
			</div>
			<div className="mb-8">
				<Form method="post">
					<div className="flex flex-col space-y-2">
						<div className="flex items-center space-x-2">
							<TargetLanguageSelector />
							<AIModelSelector onModelSelect={setSelectedModel} />
						</div>
						<input type="hidden" name="pageId" value={pagWithTranslations.id} />
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
						<AlertTitle className="text-center">Translation Started</AlertTitle>
						<AlertDescription className="text-center">
							<strong className="font-semibold ">{actionData.slug}</strong>
						</AlertDescription>
					</Alert>
				)}
				<UserAITranslationStatus
					userAITranslationInfo={userAITranslationInfo}
				/>
			</div>
			<article className="w-full prose dark:prose-invert prose-sm sm:prose lg:prose-lg mx-auto mb-20">
				<ContentWithTranslations
					pageWithTranslations={pagWithTranslations}
					currentUserName={currentUser?.userName ?? null}
				/>
			</article>
			<GeminiApiKeyDialog
				isOpen={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			/>
		</div>
	);
}

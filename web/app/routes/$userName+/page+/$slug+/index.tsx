import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { useNavigation } from "@remix-run/react";
import { Form } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { Languages, SquarePen } from "lucide-react";
import { useState } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { LoadingSpinner } from "~/components/LoadingSpinner";
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
	fetchPageWithSourceTexts,
	fetchPageWithTranslations,
	fetchUserAITranslationInfo,
} from "./functions/queries.server";
import { actionSchema } from "./types";

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
	const pageWithTranslations = await fetchPageWithTranslations(
		slug,
		nonSanitizedUser?.id ?? 0,
		targetLanguage,
	);

	if (!pageWithTranslations) {
		throw new Response("Failed to fetch article", { status: 500 });
	}
	const isOwner = pageWithTranslations?.user.userName === currentUser?.userName;
	if (pageWithTranslations.isArchived) {
		throw new Response("Page not found", { status: 404 });
	}
	if (!isOwner && !pageWithTranslations.isPublished) {
		throw new Response("Page not found", { status: 404 });
	}
	const userAITranslationInfo = await fetchUserAITranslationInfo(
		pageWithTranslations.id,
		nonSanitizedUser?.id ?? 0,
	);
	return typedjson({
		targetLanguage,
		pageWithTranslations,
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
			const pageWithSourceTexts = await fetchPageWithSourceTexts(
				submission.value.pageId,
			);
			if (!pageWithSourceTexts) {
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
				pageWithSourceTexts.id,
				submission.value.aiModel,
				targetLanguage,
			);

			const queue = getTranslateUserQueue(nonSanitizedUser.id);
			const job = await queue.add(`translate-${nonSanitizedUser.id}`, {
				userAITranslationInfoId: userAITranslationInfo.id,
				geminiApiKey: nonSanitizedUser.geminiApiKey,
				aiModel: submission.value.aiModel,
				userId: nonSanitizedUser.id,
				pageId: pageWithSourceTexts.id,
				targetLanguage,
				title: pageWithSourceTexts.title,
				numberedContent: pageWithSourceTexts.content,
				numberedElements: pageWithSourceTexts.sourceTexts,
			});
			return {
				intent,
				lastResult: submission.reply({ resetForm: true }),
				slug: pageWithSourceTexts.slug,
			};
		}
		default:
			throw new Error("Invalid Intent");
	}
};

export default function ReaderView() {
	const {
		pageWithTranslations,
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

	if (!pageWithTranslations) {
		return <div>Loading...</div>;
	}

	return (
		<div className=" w-full max-w-3xl  mx-auto">
			{pageWithTranslations.user.userName === currentUser?.userName &&
				currentUser && (
					<div className="flex justify-end items-center mb-3">
						<Button asChild variant="outline">
							<Link
								to={`/${currentUser.userName}/page/${pageWithTranslations.slug}/edit`}
							>
								<SquarePen className="w-6 h-6" />
							</Link>
						</Button>
					</div>
				)}
			<div className="mb-8">
				<Form method="post">
					<div className="flex flex-col space-y-2">
						<div className="flex items-center space-x-2">
							<TargetLanguageSelector />
							<AIModelSelector onModelSelect={setSelectedModel} />
						</div>
						<input
							type="hidden"
							name="pageId"
							value={pageWithTranslations.id}
						/>
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
				<UserAITranslationStatus
					userAITranslationInfo={userAITranslationInfo}
				/>
			</div>
			<article className="w-full prose dark:prose-invert sm:prose lg:prose-lg mx-auto mb-20">
				<ContentWithTranslations
					pageWithTranslations={pageWithTranslations}
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

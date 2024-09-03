import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { getTranslateUserQueue } from "~/features/translate/translate-user-queue";
import i18nServer from "~/i18n.server";
import { getNonSanitizedUserbyUserName } from "~/routes/functions/queries.server";
import { authenticator } from "~/utils/auth.server";
import { stripHtmlTags } from "../../utils/stripHtmlTags";
import { ContentWithTranslations } from "./components/ContentWithTranslations";
import { ShareDialog } from "./components/ShareDialog";
import { createUserAITranslationInfo } from "./functions/mutations.server";
import {
	fetchLatestUserAITranslationInfo,
	fetchPageWithSourceTexts,
	fetchPageWithTranslations,
} from "./functions/queries.server";
import { actionSchema } from "./types";
import { getBestTranslation } from "./utils/get-best-translation";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	if (!data) {
		return [{ title: "Page Not Found" }];
	}

	const { pageWithTranslations, title } = data;

	const description = stripHtmlTags(pageWithTranslations.content).slice(0, 200);
	const imageUrl = pageWithTranslations.user.icon;

	return [
		{ title: title },
		{ name: "description", content: description },
		{ property: "og:type", content: "article" },
		{ property: "og:title", content: title },
		{ property: "og:description", content: description },
		{ property: "og:image", content: imageUrl },
		{ name: "twitter:card", content: "summary" },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },
		{ name: "twitter:image", content: imageUrl },
	];
};

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
	const targetLanguage = await i18nServer.getLocale(request);
	const pageWithTranslations = await fetchPageWithTranslations(
		slug,
		currentUser?.id ?? 0,
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
	const sourceTitle = pageWithTranslations.sourceTextWithTranslations
		.filter((item) => item.sourceText?.number === 0)
		.sort((a, b) => {
			if (a.sourceText && b.sourceText) {
				return (
					new Date(b.sourceText.createdAt).getTime() -
					new Date(a.sourceText.createdAt).getTime()
				);
			}
			return 0;
		})[0];
	const bestTranslationTitle = getBestTranslation(
		sourceTitle.translationsWithVotes,
	);
	const userAITranslationInfo = await fetchLatestUserAITranslationInfo(
		pageWithTranslations.id,
		nonSanitizedUser?.id ?? 0,
		targetLanguage,
	);
	const title = bestTranslationTitle
		? `${sourceTitle.sourceText.text} - ${bestTranslationTitle.text}`
		: sourceTitle.sourceText.text;
	return typedjson({
		targetLanguage,
		pageWithTranslations,
		currentUser,
		hasGeminiApiKey,
		userAITranslationInfo,
		sourceTitle,
		title,
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
	const targetLanguage = await i18nServer.getLocale(request);

	if (submission.status !== "success") {
		return { intent: null, lastResult: submission.reply(), slug: null };
	}
	const { intent } = submission.value;
	switch (intent) {
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

export default function Page() {
	const {
		pageWithTranslations,
		currentUser,
		hasGeminiApiKey,
		userAITranslationInfo,
		sourceTitle,
		title,
		targetLanguage,
	} = useTypedLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const [form, fields] = useForm({
		lastResult: actionData?.lastResult,
	});

	const shareUrl = typeof window !== "undefined" ? window.location.href : "";

	return (
		<div className=" w-full max-w-3xl  mx-auto">
			<article className="w-full prose dark:prose-invert sm:prose lg:prose-lg mx-auto mb-20">
				<ContentWithTranslations
					pageWithTranslations={pageWithTranslations}
					sourceTitle={sourceTitle}
					currentUserName={currentUser?.userName}
					hasGeminiApiKey={hasGeminiApiKey}
					userAITranslationInfo={userAITranslationInfo}
					targetLanguage={targetLanguage}
				/>
			</article>
			<div className="flex justify-center space-x-4 mt-8">
				<ShareDialog url={shareUrl} title={title} />
			</div>
		</div>
	);
}

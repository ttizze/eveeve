import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Header } from "~/components/Header";
import { normalizeAndSanitizeUrl } from "~/utils/normalize-and-sanitize-url.server";
import { getTargetLanguage } from "~/utils/target-language.server";
import { authenticator } from "../../utils/auth.server";
import { ContentWithTranslations } from "./components/ContentWithTranslations";
import {
	handleAddTranslationAction,
	handleVoteAction,
} from "./functions/mutations.server";
import { fetchLatestPageVersionWithTranslations } from "./functions/queries.server";
import { actionSchema } from "./types";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const { "*": urlParam } = params;

	if (!urlParam) {
		throw new Response("Missing URL parameter", { status: 400 });
	}

	const safeUser = await authenticator.isAuthenticated(request);
	const safeUserId = safeUser?.id;
	const targetLanguage = await getTargetLanguage(request);
	const normalizedUrl = normalizeAndSanitizeUrl(urlParam);
	const pageData = await fetchLatestPageVersionWithTranslations(
		normalizedUrl,
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
		default:
			throw new Error("Invalid Intent");
	}
};

export default function ReaderView() {
	const { "*": urlParam } = useParams();
	const { pageData, safeUser } = useTypedLoaderData<typeof loader>();

	if (!pageData) {
		return <div>Loading...</div>;
	}

	const originalUrl = urlParam ? decodeURIComponent(urlParam) : "";

	return (
		<div>
			<Header safeUser={safeUser} />
			<div className="container mx-auto px-4 py-8">
				<article className="prose dark:prose-invert lg:prose-xl mx-auto">
					<h1>{pageData.title}</h1>
					<p>
						<a
							href={originalUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-500 hover:underline"
						>
							Original Article
						</a>
					</p>
					<hr />
					<ContentWithTranslations
						content={pageData.content}
						sourceTextInfoWithTranslations={
							pageData.sourceTextInfoWithTranslations
						}
						userId={safeUser?.id ?? null}
					/>
					<p>license: {pageData.license}</p>
				</article>
			</div>
		</div>
	);
}

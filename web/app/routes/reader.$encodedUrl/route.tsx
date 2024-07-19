import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	json,
} from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Header } from "~/components/Header";
import { getSession } from "~/utils/session.server";
import { authenticator } from "../../utils/auth.server";
import { TranslatedContent } from "./components/TranslatedContent";
import type { TranslationData } from "./types";
import { fetchLatestPageVersionWithTranslations } from "./utils";
import { handleAddTranslationAction, handleVoteAction } from "./utils/actions";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const session = await getSession(request.headers.get("Cookie"));
	const targetLanguage = session.get("targetLanguage") || "ja";

	const { encodedUrl } = params;
	if (!encodedUrl) {
		throw new Response("Missing URL parameter", { status: 400 });
	}
	const safeUser = await authenticator.isAuthenticated(request);
	const safeUserId = safeUser?.id;
	const pageData = await fetchLatestPageVersionWithTranslations(
		decodeURIComponent(encodedUrl),
		safeUserId ?? 0,
		targetLanguage,
	);

	if (!pageData) {
		throw new Response("Failed to fetch article", { status: 500 });
	}

	return typedjson({ pageData, safeUser, targetLanguage });
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const safeUser = await authenticator.isAuthenticated(request);
	const safeUserId = safeUser?.id;

	if (!safeUserId) {
		return json({ error: "User not authenticated" }, { status: 401 });
	}

	const formData = await request.formData();
	const action = formData.get("action");

	switch (action) {
		case "vote":
			return handleVoteAction(formData, safeUserId);
		case "addTranslation":
			return handleAddTranslationAction(formData, safeUserId);
		default:
			return json({ error: "Invalid action" }, { status: 400 });
	}
};

export default function ReaderView() {
	const { encodedUrl } = useParams();
	const { pageData, safeUser, targetLanguage } =
		useTypedLoaderData<typeof loader>();
	const fetcher = useFetcher();

	if (!pageData) {
		return <div>Loading...</div>;
	}

	const originalUrl = encodedUrl ? decodeURIComponent(encodedUrl) : "";
	const handleVote = (translationId: number, isUpvote: boolean) => {
		fetcher.submit(
			{
				action: "vote",
				translateTextId: translationId.toString(),
				isUpvote: isUpvote ? "true" : "false",
			},
			{ method: "post" },
		);
	};

	const handleAddTranslation = (sourceTextId: number, text: string) => {
		fetcher.submit(
			{
				action: "addTranslation",
				sourceTextId: sourceTextId.toString(),
				text,
			},
			{ method: "post" },
		);
	};
	return (
		<div>
			<Header safeUser={safeUser} targetLanguage={targetLanguage} />
			<div className="container mx-auto px-4 py-8">
				<article className="prose dark:prose-invert lg:prose-xl mx-auto max-w-3xl">
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
					<TranslatedContent
						content={pageData.content}
						translations={
							pageData.translations as Array<{
								number: number;
								translations: TranslationData[];
							}>
						}
						targetLanguage="ja"
						onVote={handleVote}
						onAdd={handleAddTranslation}
						userId={safeUser?.id ?? null}
					/>
				</article>
			</div>
		</div>
	);
}

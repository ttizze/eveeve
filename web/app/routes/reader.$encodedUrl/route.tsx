import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	json,
} from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { getSession } from "~/utils/session.server";
import { authenticator } from "../../utils/auth.server";
import { TranslatedContent } from "./components/TranslatedContent";
import type { TranslationData } from "./types";
import { fetchLatestPageVersionWithTranslations } from "./utils";
import { handleAddTranslationAction, handleVoteAction } from "./utils/actions";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const session = await getSession(request.headers.get("Cookie"));
	const language = session.get("language") || "ja";

	const { encodedUrl } = params;
	if (!encodedUrl) {
		throw new Response("Missing URL parameter", { status: 400 });
	}
	const user = await authenticator.isAuthenticated(request);
	const userId = user?.id;
	const pageData = await fetchLatestPageVersionWithTranslations(
		decodeURIComponent(encodedUrl),
		userId ?? 0,
		language,
	);

	if (!pageData) {
		throw new Response("Failed to fetch article", { status: 500 });
	}

	return json(pageData);
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const user = await authenticator.isAuthenticated(request);
	const userId = user?.id;

	if (!userId) {
		return json({ error: "User not authenticated" }, { status: 401 });
	}

	const formData = await request.formData();
	const action = formData.get("action");

	switch (action) {
		case "vote":
			return handleVoteAction(formData, userId);
		case "addTranslation":
			return handleAddTranslationAction(formData, userId);
		default:
			return json({ error: "Invalid action" }, { status: 400 });
	}
};

export default function ReaderView() {
	const { encodedUrl } = useParams();
	const { title, url, content, translations, userId } =
		useLoaderData<typeof loader>();
	const fetcher = useFetcher();

	if (!title || !url || !content || !translations) {
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
		<div className="container mx-auto px-4 py-8">
			<article className="prose lg:prose-xl mx-auto max-w-3xl">
				<h1 className="text-center">{title}</h1>
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
				<TranslatedContent
					content={content}
					translations={
						translations as Array<{
							number: number;
							translations: TranslationData[];
						}>
					}
					targetLanguage="ja"
					onVote={handleVote}
					onAdd={handleAddTranslation}
					userId={userId ?? null}
				/>
			</article>
		</div>
	);
}

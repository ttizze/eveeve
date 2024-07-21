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
import { prisma } from "~/utils/prisma";
import { splitContentByHeadings } from "./utils";
import { useNavigate } from "@remix-run/react";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const session = await getSession(request.headers.get("Cookie"));
	const targetLanguage = session.get("targetLanguage") || "ja";

	const { encodedUrl } = params;
	if (!encodedUrl) {
		throw new Response("Missing URL parameter", { status: 400 });
	}
	const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get("page") || "1", 10);

	const safeUser = await authenticator.isAuthenticated(request);
	const safeUserId = safeUser?.id;
  const fullPageVersion = await prisma.pageVersion.findFirst({
    where: { url: decodeURIComponent(encodedUrl) },
    orderBy: { createdAt: "desc" },
    select: { content: true },
  });
	if (!fullPageVersion) {
		throw new Response("Failed to fetch article", { status: 500 });
	}
	const sections = splitContentByHeadings(fullPageVersion.content);

  const currentSection = sections[1];
	console.log(currentSection);
  if (!currentSection) {
    throw new Response("Page not found", { status: 404 });
  }
	const currentNumbers = currentSection.dataNumber;

	const currentPageData = await fetchLatestPageVersionWithTranslations(
		decodeURIComponent(encodedUrl),
		safeUserId ?? 0,
		targetLanguage,
		currentNumbers,
	);

	if (!currentPageData) {
		throw new Response("Failed to fetch article", { status: 500 });
	}

	return typedjson({ currentPageData, safeUser, currentPage: page, totalPages: sections.length,sectionHtml: currentSection.html, targetLanguage });
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const safeUser = await authenticator.isAuthenticated(request);
	const safeUserId = safeUser?.id;
	const session = await getSession(request.headers.get("Cookie"));
	const targetLanguage = session.get("targetLanguage") || "ja";

	if (!safeUserId) {
		return json({ error: "User not authenticated" }, { status: 401 });
	}

	const formData = await request.formData();
	const action = formData.get("action");

	switch (action) {
		case "vote":
			return handleVoteAction(formData, safeUserId);
		case "addTranslation":
			return handleAddTranslationAction(formData, safeUserId, targetLanguage);
		default:
			return json({ error: "Invalid action" }, { status: 400 });
	}
};

export default function ReaderView() {
	const { encodedUrl } = useParams();
	const { currentPageData, safeUser, currentPage, totalPages, sectionHtml, targetLanguage } = useTypedLoaderData<typeof loader>();

	const fetcher = useFetcher();

	if (!currentPageData) {
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
				sourceTextId: sourceTextId,
				text,
			},
			{ method: "post" },
		);
	};
	return (
		<div>
			<Header safeUser={safeUser} />
			<div className="container mx-auto px-4 py-8">
				<article className="prose dark:prose-invert lg:prose-xl mx-auto max-w-3xl">
					<h1>{currentPageData.title}</h1>
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
						content={sectionHtml}
						translations={
							currentPageData.translations as Array<{
								number: number;
								sourceTextId: number;
								translations: TranslationData[];
							}>
						}
						targetLanguage={targetLanguage}
						onVote={handleVote}
						onAdd={handleAddTranslation}
						userId={safeUser?.id ?? null}
					/>
				</article>
			</div>
		</div>
	);
}

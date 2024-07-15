import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { prisma } from "../../utils/prisma";
import { TranslatedContent } from "./components/TranslatedContent";

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { encodedUrl } = params;
	if (!encodedUrl) {
		throw new Response("Missing URL parameter", { status: 400 });
	}
	const latestPageVersion = await prisma.pageVersion.findFirst({
		where: { url: decodeURIComponent(encodedUrl) },
		orderBy: { createdAt: "desc" },
		include: {
			sourceTexts: {
				include: {
					translateTexts: {
						where: { language: "ja" },
						orderBy: [
							{ point: "desc" },
							{ createdAt: "desc" }
						],
						take: 1,
					},
				},
			},
		},
	});
	if (!latestPageVersion) {
		throw new Response("Failed to fetch article", { status: 500 });
	}

	const translations = latestPageVersion.sourceTexts.map((sourceText) => ({
		number: sourceText.number,
		text: sourceText.translateTexts[0]?.text,
	}));

  return json({
    title: latestPageVersion.title,
    url: latestPageVersion.url,
    content: latestPageVersion.content,
    translations,
  });
};

export default function ReaderView() {
	const { encodedUrl } = useParams();
	const { title, url, content, translations } = useLoaderData<typeof loader>();

	if (!title || !url || !content || !translations) {
		return <div>Loading...</div>;
	}

	const originalUrl = encodedUrl ? decodeURIComponent(encodedUrl) : "";

	return (
		<div className="container mx-auto px-4 py-8">
			<article className="prose lg:prose-xl">
				<h1>{title}</h1>
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
				<TranslatedContent content={content} translations={translations} targetLanguage="ja" />
			</article>
		</div>
	);
}

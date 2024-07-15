import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import parse from "html-react-parser";
import { extractNumberedElements } from "../../utils/extractNumberedElements";
import { prisma } from "../../utils/prisma";
import { displayContent } from "./utils/create";

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
						orderBy: { createdAt: "desc" },
						take: 1,
					},
				},
			},
		},
	});
	if (!latestPageVersion) {
		throw new Response("Failed to fetch article", { status: 500 });
	}

	// コンテンツから番号付き要素を抽出
	const numberedElements = extractNumberedElements(latestPageVersion.content);

	// 翻訳テキストを適用
	console.log("latestPageVersion.sourceTexts", latestPageVersion.sourceTexts);
	const translatedElements = numberedElements.map((element) => {
		const sourceText = latestPageVersion.sourceTexts.find(
			(st) => st.text === element.text,
		);
		if (sourceText && sourceText.translateTexts.length > 0) {
			return {
				...element,
				text: sourceText.translateTexts[0].text,
			};
		}
		return element;
	});

	// 翻訳されたコンテンツを生成
	const translatedContent = await displayContent(
		latestPageVersion.content,
		translatedElements,
	);

	return json({
		title: latestPageVersion.title,
		url: latestPageVersion.url,
		content: translatedContent,
	});
};

export default function ReaderView() {
	const { encodedUrl } = useParams();
	const article = useLoaderData<typeof loader>();

	if (!article) {
		return <div>Loading...</div>;
	}

	const originalUrl = encodedUrl ? decodeURIComponent(encodedUrl) : "";

	return (
		<div className="container mx-auto px-4 py-8">
			<article className="prose lg:prose-xl">
				<h1>{article.title}</h1>
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
				<div>{parse(article.content)}</div>
			</article>
		</div>
	);
}

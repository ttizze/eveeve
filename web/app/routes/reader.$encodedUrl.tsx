import { useLoaderData,useParams } from "@remix-run/react";
import {json, type  LoaderFunctionArgs } from "@remix-run/cloudflare";
import parse from "html-react-parser";

type Article = {
  title: string;
  content: string;
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { encodedUrl } = params;
  if (!encodedUrl) {
    throw new Response("Missing URL parameter", { status: 400 });
  }
  const url = decodeURIComponent(encodedUrl);
  const apiUrl = new URL(`${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/get-article`);
  apiUrl.searchParams.append("url", url);

  try {
    const response = await fetch(apiUrl.toString());
    if (!response.ok) {
      throw new Response(`API request failed with status ${response.status}`, { status: response.status });
    }
    const data: Article = await response.json();
    return json(data);
  } catch (error) {
    console.error("Error fetching article:", error);
    throw new Response("Failed to fetch article", { status: 500 });
  }
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
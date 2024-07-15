import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Card } from "~/components/ui/card";
import { extractNumberedElements } from "../../utils/extractNumberedElements";
import {
	URLTranslationForm,
	urlTranslationSchema,
} from "./components/URLTranslationForm";
import { addNumbersToContent } from "./utils/addNumbersToContent";
import { extractArticle } from "./utils/articleUtils";
import { fetchWithRetry } from "./utils/fetchWithRetry";
import { translate } from "./utils/translation";

export const meta: MetaFunction = () => {
	return [
		{ title: "EveEve" },
		{
			name: "description",
			content:
				"EveEveは、インターネット上のテキストを翻訳できるオープンソースプロジェクトです。",
		},
	];
};

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const submission = parseWithZod(formData, { schema: urlTranslationSchema });
	if (submission.status !== "success") {
		return json({
			result: submission.reply(),
			url: "",
			html: "",
			title: "",
			numberedContent: "",
			extractedNumberedElements: "",
			translationResult: "",
		});
	}
	const html = await fetchWithRetry(submission.value.url);
	const { content, title } = extractArticle(html);
	const numberedContent = addNumbersToContent(content);
	const extractedNumberedElements = extractNumberedElements(numberedContent);
	console.log("extractedNumberedElements", extractedNumberedElements);
	const translationStatus = await translate(
		submission.value.targetLanguage,
		title,
		numberedContent,
		extractedNumberedElements,
		submission.value.url,
	);
	return json({
		result: submission.reply(),
		url: submission.value.url,
		html,
		title,
		numberedContent,
		extractedNumberedElements,
		translationStatus,
	});
}

export default function Index() {
	return (
		<div className="container mx-auto max-w-2xl py-8">
			<Card>
				<URLTranslationForm />
			</Card>
		</div>
	);
}

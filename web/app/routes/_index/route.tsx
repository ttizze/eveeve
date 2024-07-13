import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useNavigation, Link } from "@remix-run/react";
import { useForm, getFormProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { extractArticle } from "./utils/articleUtils";
import { addNumbersToContent } from "./utils/addNumbersToContent";
import { extractNumberedElements } from "../../utils/extractNumberedElements";
import { translate } from "./utils/translation";
import { fetchWithRetry } from "./utils/fetchWithRetry";

export const meta: MetaFunction = () => {
	return [
		{ title: "EveEve" },
		{ name: "description", content: "EveEveは、インターネット上のテキストを翻訳できるオープンソースプロジェクトです。" },
	];
};

const urlSchema = z.object({
	url: z.string().url("有効なURLを入力してください"),
});

export async function loader() {
	return {};
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const submission = parseWithZod(formData, { schema: urlSchema });
	if (submission.status !== "success") {
		return json({ result: submission.reply(), url: "", html: "", title: "", numberedContent: "", extractedNumberedElements: "", translationResult: "" });
	}
	const html = await fetchWithRetry(submission.value.url);
	const { content, title } = extractArticle(html);
	const numberedContent = addNumbersToContent(content);
	const extractedNumberedElements = extractNumberedElements(numberedContent)
	console.log('extractedNumberedElements', extractedNumberedElements)
	const translationStatus = await translate(title, numberedContent, extractedNumberedElements, submission.value.url);
	return json({ result: submission.reply(), url: submission.value.url, html, title, numberedContent, extractedNumberedElements, translationStatus });
}


export default function Index() {
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();

	const [form, field] = useForm({
		id: "url-form",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: urlSchema });
		},
	});

	return (
		<div className="font-sans p-4">
			<h1 className="text-3xl">EveEve</h1>
			<Form method="post" {...getFormProps(form)}>
				<input
					type="url"
					name="url"
					placeholder="URLを入力"
					required
					className="border p-2"
				/>
				<button
					type="submit"
					disabled={navigation.state === "submitting"}
					className="bg-blue-500 text-white p-2 ml-2"
				>
					{navigation.state === "submitting" ? "処理中..." : "翻訳を開始"}
				</button>
			</Form>
			{actionData?.result.status === "error" && (
				<ul className="text-red-500 mt-2" id={field.url.errorId}>{field.url.errors}</ul>
			)}
			{actionData?.result.status === "success" && (
				<div>
					<Link
						to={`/reader/${encodeURIComponent(actionData.url)}`}
						className="text-blue-500 hover:underline"
					>
						<h2>{actionData.title}</h2>
					</Link>
				</div>
			)}
		</div>
	);
}
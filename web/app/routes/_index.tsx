import type { ActionFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json  } from "@remix-run/cloudflare";
import { json as reactJson, Form, useActionData, useNavigation, Link, type ClientActionFunctionArgs } from "@remix-run/react";
import { useForm, getFormProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { extractArticle, displayContent } from "../utils/articleUtils";
import { addNumbersToContent } from "../utils/addNumbersToContent";
import { extractNumberedElements } from "../utils/extractNumberedElements";
import { translate } from "./translation";

type ServerActionData = {
	result: { status: string };
	url: string;
	html: string;
};

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
      return json({ result: submission.reply(), url: "", html: "" });
    }
    const response = await fetch(submission.value.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0',
        Referer: 'https://www.google.com',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch the URL: ${response.status} ${response.statusText}`);
    }
    const html = await response.text();
    return json({ result: submission.reply(), url: submission.value.url, html });
}

export const clientAction = async ({
	serverAction,
}: ClientActionFunctionArgs) => {
	const data = await serverAction() as ServerActionData;
	const { content, title } = extractArticle(data.html);
	const numberedContent = addNumbersToContent(content);
	const extractedNumberedElements = extractNumberedElements(numberedContent);
  const translationResult = await translate(title,numberedContent, extractedNumberedElements, data.url);
	return reactJson({
		...data,
		processedData: { title, numberedContent, extractedNumberedElements },
		translationResult,
	});
};

export default function Index() {
	const actionData = useActionData<typeof clientAction>();
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
					<h2>{actionData.processedData.title}</h2>
					</Link>
				</div>
			)}
		</div>
	);
}
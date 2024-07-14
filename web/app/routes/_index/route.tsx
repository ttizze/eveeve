import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { z } from "zod";
import { extractNumberedElements } from "../../utils/extractNumberedElements";
import { addNumbersToContent } from "./utils/addNumbersToContent";
import { extractArticle } from "./utils/articleUtils";
import { fetchWithRetry } from "./utils/fetchWithRetry";
import { translate } from "./utils/translation";
import { authenticator } from "../../utils/auth.server";

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

const urlSchema = z.object({
	url: z.string().url("有効なURLを入力してください"),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  return json({ user });
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const submission = parseWithZod(formData, { schema: urlSchema });
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
		"ja",
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
	const { user } = useLoaderData<typeof loader>();
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
			{user ? (
				<div>
					<p>ようこそ、{user.name}さん！</p>
					<Link to="/auth/logout" className="text-blue-500 hover:underline">
					ログアウト
				</Link>
				</div>
      ) : (
        <div>
          <Link to="/auth/login" className="text-blue-500 hover:underline mr-4">
            ログイン
          </Link>
          <Link to="/auth/signup" className="text-blue-500 hover:underline">
            サインアップ
          </Link>
        </div>
      )}
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
				<ul className="text-red-500 mt-2" id={field.url.errorId}>
					{field.url.errors}
				</ul>
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

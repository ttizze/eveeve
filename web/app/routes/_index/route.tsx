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
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "~/components/ui/card"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { getSession, commitSession } from "~/utils/session.server";


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
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();

	const [form, field] = useForm({
		id: "url-form",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: urlSchema });
		},
	});

	return (
		<div className="container mx-auto max-w-2xl py-8">
      <Card>
          <Form method="post" {...getFormProps(form)} className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="url"
                name="url"
                placeholder="URLを入力"
                required
                className="flex-grow"
              />
              <Button
                type="submit"
                disabled={navigation.state === "submitting"}
              >
                {navigation.state === "submitting" ? "処理中..." : "翻訳を開始"}
              </Button>
            </div>
          </Form>
          
          {actionData?.result.status === "error" && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>
                <ul id={field.url.errorId}>
                  {field.url.errors}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {actionData?.result.status === "success" && (
            <div className="mt-4">
              <Link
                to={`/reader/${encodeURIComponent(actionData.url)}`}
                className="text-blue-500 hover:underline"
              >
                <h2 className="text-xl font-semibold">{actionData.title}</h2>
              </Link>
            </div>
          )}
      </Card>
    </div>
	);
}

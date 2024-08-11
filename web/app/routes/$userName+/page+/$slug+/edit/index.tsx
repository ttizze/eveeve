import {
	getFormProps,
	getTextareaProps,
	useForm,
	useInputControl,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
	Form,
	useActionData,
	useLoaderData,
	useNavigate,
} from "@remix-run/react";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { authenticator } from "~/utils/auth.server";
import { Header } from "./components/Header";
import { createOrUpdateSourceTexts } from "./functions/mutations.server";
import { getOrCreatePage } from "./functions/mutations.server";
import { getPageBySlug } from "./functions/queries.server";
import { addNumbersToContent } from "./utils/addNumbersToContent";
import { extractNumberedElements } from "./utils/extractNumberedElements";
import { Footer } from "~/routes/resources+/footer";
const schema = z.object({
	title: z.string().min(1, "タイトルは必須です"),
	pageContent: z.string().min(1, "内容は必須です"),
});

export const loader: LoaderFunction = async ({ params, request }) => {
	const { userId, slug } = params;
	if (!userId || !slug) throw new Error("Invalid params");

	const safeUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	if (safeUser.id !== Number.parseInt(userId)) {
		throw new Response("Unauthorized", { status: 403 });
	}

	const page = await getPageBySlug(slug);

	return { safeUser, page };
};

export const action: ActionFunction = async ({ request, params }) => {
	const { userId, slug } = params;
	if (!userId || !slug) throw new Error("Invalid params");

	const safeUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	const formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema,
	});
	if (submission.status !== "success") {
		return { lastResult: submission.reply() };
	}

	const { title, pageContent } = submission.value;
	const numberedContent = addNumbersToContent(pageContent);
	console.log(numberedContent);
	const page = await getOrCreatePage(safeUser.id, slug, title, numberedContent);
	const numberedElements = extractNumberedElements(numberedContent);
	await createOrUpdateSourceTexts(numberedElements, page.id);

	return redirect(`/${safeUser.id}/page/${slug}`);
};

export default function EditPage() {
	const { safeUser, page } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const pageContentControl = useInputControl({
		name: "pageContent",
		formId: "edit-page",
	});

	const navigate = useNavigate();

	const [form, { title, pageContent }] = useForm({
		id: "edit-page",
		lastResult: actionData?.lastResult,
		defaultValue: {
			title: page?.title,
			pageContent: page?.content,
		},
	});

	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
			Placeholder.configure({
				placeholder: "input content...",
			}),
		],

		content: page?.content || "",
		editorProps: {
			attributes: {
				class:
					"prose dark:prose-invert prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none",
			},
		},
		onUpdate: ({ editor }) => {
			pageContentControl.change(editor.getHTML());
		},
	});

	return (
		<div>
			<Header safeUser={safeUser} />
			<div className="w-full max-w-3xl mx-auto">
				<Form method="post" {...getFormProps(form)}>
					<div className="mt-10">
						<h1 className="text-4xl font-bold">
							<textarea
								{...getTextareaProps(title)}
								placeholder="input title..."
								className="w-full outline-none bg-transparent  resize-none"
							/>
						</h1>
						{title.errors?.map((error) => (
							<p className="text-sm text-red-500" key={error}>
								{error}
							</p>
						))}
					</div>
					<hr className="my-10" />
					<div className="mt-16">
						<EditorContent editor={editor} />
						{pageContent.errors?.map((error) => (
							<p className="text-sm text-red-500" key={error}>
								{error}
							</p>
						))}
					</div>
					<div className="flex justify-between">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate(-1)}
						>
							キャンセル
						</Button>
						<Button type="submit">保存</Button>
					</div>
				</Form>
			</div>
			<Footer safeUser={safeUser} />
		</div>
	);
}

import { getFormProps, getTextareaProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import { authenticator } from "~/utils/auth.server";
import { EditFooter } from "./components/EditFooter";
import { EditHeader } from "./components/EditHeader";
import { Editor } from "./components/editor/Editor";
import { createOrUpdateSourceTexts } from "./functions/mutations.server";
import { createOrUpdatePage } from "./functions/mutations.server";
import {
	getPageBySlug,
	getTitleSourceTextId,
} from "./functions/queries.server";
import { addNumbersToContent } from "./utils/addNumbersToContent";
import { addSourceTextIdToContent } from "./utils/addSourceTextIdToContent";
import { extractTextElementInfo } from "./utils/extractTextElementInfo";
import { getPageSourceLanguage } from "./utils/getPageSourceLanguage";
import { removeSourceTextIdDuplicatesAndEmptyElements } from "./utils/removeSourceTextIdDuplicates";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	if (!data) {
		return [{ title: "Edit Page" }];
	}
	return [{ title: `Edit ${data.page?.title}` }];
};

const schema = z.object({
	title: z.string().min(1, "Required"),
	pageContent: z.string().min(1, "Required Change something"),
	isPublished: z.enum(["true", "false"]).transform((val) => val === "true"),
});

export const loader: LoaderFunction = async ({ params, request }) => {
	const { userName, slug } = params;
	if (!userName || !slug) throw new Error("Invalid params");

	const currentUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	if (currentUser.userName !== userName) {
		throw new Response("Unauthorized", { status: 403 });
	}

	const page = await getPageBySlug(slug);

	return { currentUser, page };
};

export const action: ActionFunction = async ({ request, params }) => {
	const { userName, slug } = params;
	if (!userName || !slug) throw new Error("Invalid params");

	const currentUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});
	if (currentUser.userName !== userName) {
		throw new Response("Unauthorized", { status: 403 });
	}
	const formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema,
	});
	if (submission.status !== "success") {
		return { lastResult: submission.reply() };
	}

	const { title, pageContent, isPublished } = submission.value;
	const titleSourceTextId = await getTitleSourceTextId(slug);
	//tiptapが既存の要素を引き継いで重複したsourceTextIdを追加してしまうため、重複を削除
	const numberedContent = await removeSourceTextIdDuplicatesAndEmptyElements(
		addNumbersToContent(pageContent),
	);
	const textElements = await extractTextElementInfo(
		numberedContent,
		title,
		titleSourceTextId,
	);

	const sourceLanguage = await getPageSourceLanguage(textElements);
	//pageIdを使用するため､ここで一旦pageを作成する
	const page = await createOrUpdatePage(
		currentUser.id,
		slug,
		title,
		numberedContent,
		isPublished,
		sourceLanguage,
	);

	const sourceTextsIdWithNumber = await createOrUpdateSourceTexts(
		textElements,
		page.id,
	);
	const contentWithSourceTextId = addSourceTextIdToContent(
		numberedContent,
		sourceTextsIdWithNumber,
	);
	await createOrUpdatePage(
		currentUser.id,
		slug,
		title,
		contentWithSourceTextId,
		isPublished,
		sourceLanguage,
	);
	return null;
};

export default function EditPage() {
	const { currentUser, page } = useLoaderData<typeof loader>();
	const fetcher = useFetcher<typeof action>();
	const [form, fields] = useForm({
		id: "edit-page",
		lastResult: fetcher.data?.lastResult,
		constraint: getZodConstraint(schema),
		defaultValue: {
			title: page?.title,
			pageContent: page?.content,
			isPublished: page?.isPublished,
		},
	});
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	return (
		<div>
			<fetcher.Form method="post" {...getFormProps(form)}>
				<EditHeader
					currentUser={currentUser}
					pageSlug={page?.slug}
					initialIsPublished={page?.isPublished}
					fetcher={fetcher}
					hasUnsavedChanges={hasUnsavedChanges}
					setHasUnsavedChanges={setHasUnsavedChanges}
				/>
				<div className="w-full max-w-3xl prose dark:prose-invert prose-sm sm:prose lg:prose-lg mt-2 md:mt-20 mx-auto">
					<div className="mt-10 h-auto">
						<h1 className="text-4xl font-bold !mb-0 h-auto">
							<TextareaAutosize
								{...getTextareaProps(fields.title)}
								placeholder="input title..."
								className="w-full outline-none bg-transparent resize-none overflow-hidden"
								minRows={1}
								maxRows={10}
								onChange={(e) => setHasUnsavedChanges(true)}
							/>
						</h1>
						{fields.title.errors?.map((error) => (
							<p className="text-sm text-red-500" key={error}>
								{error}
							</p>
						))}
					</div>
					<hr className="!mt-2 !mb-1" />
					<div className="mt-12">
						<Editor
							initialContent={page?.content || ""}
							setHasUnsavedChanges={setHasUnsavedChanges}
						/>
						{fields.pageContent.errors?.map((error) => (
							<p className="text-sm text-red-500" key={error}>
								{error}
							</p>
						))}
					</div>
				</div>
			</fetcher.Form>
			<EditFooter />
		</div>
	);
}

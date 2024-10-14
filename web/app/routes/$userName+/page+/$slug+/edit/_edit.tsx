import {
	FormProvider,
	getFormProps,
	getTextareaProps,
	useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import { authenticator } from "~/utils/auth.server";
import { EditFooter } from "./components/EditFooter";
import { EditHeader } from "./components/EditHeader";
import { Editor } from "./components/editor/Editor";
import {
	createOrUpdatePage,
	createOrUpdateSourceTexts,
	upsertTags,
} from "./functions/mutations.server";
import {
	getAllTags,
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
	return [{ title: `Edit ${data.title}` }];
};

export const editPageSchema = z.object({
	title: z.string().min(1, "Required"),
	pageContent: z.string().min(1, "Required Change something"),
	isPublished: z.enum(["true", "false"]),
	tags: z
		.array(
			z
				.string()
				.regex(
					/^[^\s!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]+$/,
					"symbol and space can not be used",
				)
				.min(1, "tag can be min 1")
				.max(15, "tag can be max 15 characters"),
		)
		.max(5, "tags can be max 5")
		.optional(),
});

export async function loader({ params, request }: LoaderFunctionArgs) {
	const { userName, slug } = params;
	if (!userName || !slug) throw new Error("Invalid params");

	const currentUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	if (currentUser.userName !== userName) {
		throw new Response("Unauthorized", { status: 403 });
	}

	const page = await getPageBySlug(slug);
	const title = page?.sourceTexts.find(
		(sourceText) => sourceText.number === 0,
	)?.text;
	const allTags = await getAllTags();

	return { currentUser, page, allTags, title };
}

export async function action({ request, params }: ActionFunctionArgs) {
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
		schema: editPageSchema,
	});
	if (submission.status !== "success") {
		return { lastResult: submission.reply() };
	}

	const { title, pageContent, isPublished, tags } = submission.value;
	const isPublishedBool = isPublished === "true";
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

	const sourceLanguage = await getPageSourceLanguage(numberedContent, title);
	//翻訳との結びつきを維持するため、sourceTextIdを付与したpage.contentを保存し、sourceTextのnumberが変わってもsourceTextIdで紐付けられるようにしている。
	//そのため、sourceTextIdを付与したpage.contentを保存しなければならないが、createOrUpdateSourceTextsでpageIdを使用するため､ここで一旦pageを作成する
	const page = await createOrUpdatePage(
		currentUser.id,
		slug,
		title,
		numberedContent,
		isPublishedBool,
		sourceLanguage,
	);
	if (tags) {
		await upsertTags(tags, page.id);
	}
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
		isPublishedBool,
		sourceLanguage,
	);
	return null;
}

export default function EditPage() {
	const { currentUser, page, allTags, title } = useLoaderData<typeof loader>();
	const fetcher = useFetcher<typeof action>();
	const [form, fields] = useForm({
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: editPageSchema });
		},
		id: "edit-page",
		lastResult: fetcher.data?.lastResult,
		constraint: getZodConstraint(editPageSchema),
		shouldValidate: "onInput",
		defaultValue: {
			title: title,
			pageContent: page?.content,
			isPublished: page?.isPublished.toString(),
			tags: page?.tagPages.map((tagPage) => tagPage.tag.name) || [],
		},
	});
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	return (
		<div>
			<FormProvider context={form.context}>
				<fetcher.Form method="post" {...getFormProps(form)} className="pb-20">
					<EditHeader
						currentUser={currentUser}
						pageSlug={page?.slug}
						initialIsPublished={page?.isPublished}
						fetcher={fetcher}
						hasUnsavedChanges={hasUnsavedChanges}
						setHasUnsavedChanges={setHasUnsavedChanges}
						tagsMeta={fields.tags}
						initialTags={
							page?.tagPages.map((tagPage) => ({
								id: tagPage.tagId,
								name: tagPage.tag.name,
							})) || []
						}
						allTags={allTags}
					/>

					<div className="w-full max-w-3xl prose dark:prose-invert prose-sm sm:prose lg:prose-lg mt-2 md:mt-20 mx-auto px-2">
						<div className="mt-10 h-auto">
							<h1 className="text-4xl font-bold !mb-0 h-auto">
								<TextareaAutosize
									{...getTextareaProps(fields.title)}
									defaultValue={title}
									placeholder="input title..."
									className="w-full outline-none bg-transparent resize-none overflow-hidden"
									minRows={1}
									maxRows={10}
									onChange={(e) => setHasUnsavedChanges(true)}
									data-testid="title-input"
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
			</FormProvider>
			<EditFooter />
		</div>
	);
}

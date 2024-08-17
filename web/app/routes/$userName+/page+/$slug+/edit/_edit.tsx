import { getFormProps, getTextareaProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { z } from "zod";
import { authenticator } from "~/utils/auth.server";
import { EditHeader } from "./components/EditHeader";
import { Editor } from "./components/Editor";
import { createOrUpdateSourceTexts } from "./functions/mutations.server";
import { createOrUpdatePage } from "./functions/mutations.server";
import {
	getPageBySlug,
	getPageWithSourceTexts,
} from "./functions/queries.server";
import { addNumbersToContent } from "./utils/addNumbersToContent";
import { addSourceTextIdToContent } from "./utils/addSourceTextIdToContent";
import { extractNumberedElements } from "./utils/extractNumberedElements";
import { removeSourceTextIdDuplicates } from "./utils/removeSourceTextIdDuplicates";

const schema = z.object({
	title: z.string().min(1, "Required"),
	pageContent: z.string().min(1, "Required Change something"),
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

	const { title, pageContent } = submission.value;
	const existingPage = await getPageWithSourceTexts(slug);
	const titleSourceTextId =
		existingPage?.sourceTexts.find((st) => st.number === 0)?.id || null;
	//tiptapが既存の要素を引き継いで重複したsourceTextIdを追加してしまうため、重複を削除
	const numberedContent = await removeSourceTextIdDuplicates(
		addNumbersToContent(pageContent),
	);
	const numberedElements = await extractNumberedElements(
		numberedContent,
		title,
		titleSourceTextId,
	);
	const page = await createOrUpdatePage(
		currentUser.id,
		slug,
		title,
		numberedContent,
	);

	const sourceTextsIdWithNumber = await createOrUpdateSourceTexts(
		numberedElements,
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
	);
	return null;
};

export default function EditPage() {
	const { currentUser, page } = useLoaderData<typeof loader>();
	const fetcher = useFetcher<typeof action>();
	const [form, { title, pageContent }] = useForm({
		id: "edit-page",
		lastResult: fetcher.data?.lastResult,
		constraint: getZodConstraint(schema),
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		defaultValue: {
			title: page?.title,
			pageContent: page?.content,
		},
	});

	return (
		<div>
			<fetcher.Form method="post" {...getFormProps(form)}>
				<EditHeader
					currentUser={currentUser}
					pageSlug={page?.slug}
					fetcher={fetcher}
				/>
				<div className="w-full max-w-3xl prose dark:prose-invert prose-sm sm:prose lg:prose-lg mx-auto">
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
						<Editor initialContent={page?.content || ""} />
						{pageContent.errors?.map((error) => (
							<p className="text-sm text-red-500" key={error}>
								{error}
							</p>
						))}
					</div>
				</div>
			</fetcher.Form>
		</div>
	);
}

import { getFormProps, getTextareaProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { z } from "zod";
import { getNonSanitizedUserbyUserName } from "~/routes/functions/queries.server";
import { authenticator } from "~/utils/auth.server";
import { addNumbersToContent } from "../utils/addNumbersToContent";
import { extractNumberedElements } from "../utils/extractNumberedElements";
import { EditHeader } from "./components/EditHeader";
import { Editor } from "./components/Editor";
import { createOrSkipSourceTexts } from "./functions/mutations.server";
import { getOrCreatePage } from "./functions/mutations.server";
import { getPageBySlug } from "./functions/queries.server";

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
	const numberedContent = addNumbersToContent(pageContent);
	const nonSanitizedUser = await getNonSanitizedUserbyUserName(
		currentUser.userName,
	);
	if (!nonSanitizedUser) {
		throw new Response("User not found", { status: 404 });
	}
	const page = await getOrCreatePage(
		nonSanitizedUser.id,
		slug,
		title,
		numberedContent,
	);
	const numberedElements = extractNumberedElements(numberedContent, title);
	await createOrSkipSourceTexts(numberedElements, page.id);

	return redirect(`/${userName}/page/${slug}`);
};

export default function EditPage() {
	const { currentUser, page } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const fetcher = useFetcher();
	const [form, { title, pageContent }] = useForm({
		id: "edit-page",
		lastResult: actionData?.lastResult,
		defaultValue: {
			title: page?.title,
			pageContent: page?.content,
		},
	});

	return (
		<div>
			<Form method="post" {...getFormProps(form)}>
				<EditHeader currentUser={currentUser} pageSlug={page?.slug} />
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
			</Form>
		</div>
	);
}

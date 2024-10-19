import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useRevalidator } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";
import { marked } from "marked";
import { getTranslateUserQueue } from "~/features/translate/translate-user-queue";
import i18nServer from "~/i18n.server";
import { createOrUpdateSourceTexts } from "~/routes/$userName+/page+/$slug+/edit/functions/mutations.server";
import { createOrUpdatePage } from "~/routes/$userName+/page+/$slug+/edit/functions/mutations.server";
import { getTitleSourceTextId } from "~/routes/$userName+/page+/$slug+/edit/functions/queries.server";
import { addNumbersToContent } from "~/routes/$userName+/page+/$slug+/edit/utils/addNumbersToContent";
import { addSourceTextIdToContent } from "~/routes/$userName+/page+/$slug+/edit/utils/addSourceTextIdToContent";
import { extractArticle } from "~/routes/$userName+/page+/$slug+/edit/utils/extractArticle";
import { extractTextElementInfo } from "~/routes/$userName+/page+/$slug+/edit/utils/extractTextElementInfo";
import { getPageSourceLanguage } from "~/routes/$userName+/page+/$slug+/edit/utils/getPageSourceLanguage";
import { getNonSanitizedUserbyUserName } from "~/routes/functions/queries.server";
import { authenticator } from "~/utils/auth.server";
import { TranslationInputForm } from "./components/TranslationInputForm";
import { createUserAITranslationInfo } from "./functions/mutations.server";
import { translationInputSchema } from "./types";
import { generateMarkdownFromDirectory } from "./utils/generate-markdown";
import { generateSlug } from "./utils/generate-slug.server";
import { processUploadedFolder } from "./utils/process-uploaded-folder";
export async function loader({ request }: LoaderFunctionArgs) {
	const currentUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/fail",
	});

	const nonSanitizedUser = await getNonSanitizedUserbyUserName(
		currentUser.userName,
	);
	const hasGeminiApiKey = !!nonSanitizedUser?.geminiApiKey;
	const targetLanguage = await i18nServer.getLocale(request);

	return {
		currentUser,
		targetLanguage,
		hasGeminiApiKey,
	};
}

export async function action({ request }: ActionFunctionArgs) {
	const currentUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/",
	});
	const nonSanitizedUser = await getNonSanitizedUserbyUserName(
		currentUser.userName,
	);
	const formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema: translationInputSchema,
	});
	if (submission.status !== "success") {
		return { lastResult: submission.reply() };
	}

	if (!nonSanitizedUser?.geminiApiKey) {
		return {
			lastResult: submission.reply({
				formErrors: ["Gemini API key is not set"],
			}),
			slugs: [],
		};
	}

	const geminiApiKey = nonSanitizedUser.geminiApiKey;

	const targetLanguage = await i18nServer.getLocale(request);
	const queue = getTranslateUserQueue(nonSanitizedUser.id);
	const slugs: string[] = [];

	function generateLinkArticle(
		userId: number,
		folderPath: string,
		files: { name: string; slug: string }[],
	): string {
		let article = `
			# ${folderPath}
			<ul>
		`;

		for (const file of files) {
			article += `
				<li>
					<a href="/${userId}/page/${file.slug}">${file.name}</a>
					<a href="/${userId}/page/${file.slug}/edit" class="edit-link">[edit]</a>
				</li>
			`;
		}

		article += `
			</ul>
		`;

		return article;
	}

	const processFolder = async (folder: File[]) => {
		const folderStructure = processUploadedFolder(folder);

		for (const [folderPath, fileList] of Object.entries(folderStructure)) {
			const folderSlug = await generateSlug(folderPath);
			const fileInfoPromises = fileList.map(async (file) => ({
				name: file.name,
				slug: await generateSlug(file.name),
			}));
			const fileInfos = await Promise.all(fileInfoPromises);

			for (const [index, file] of fileList.entries()) {
				const fileSlug = fileInfos[index].slug;

				const markdown = await file.text();
				const html = await marked.parse(markdown);

				const titleMatch = markdown.match(/^#\s+(.*)/);
				const title = titleMatch ? titleMatch[1] : "Untitled";

				const { content } = extractArticle(html);
				const numberedContent = addNumbersToContent(content);
				const titleSourceTextId = await getTitleSourceTextId(fileSlug);
				const numberedElements = await extractTextElementInfo(
					numberedContent,
					title,
					titleSourceTextId,
				);

				const sourceLanguage = await getPageSourceLanguage(
					numberedContent,
					title,
				);
				const page = await createOrUpdatePage(
					nonSanitizedUser.id,
					fileSlug,
					title,
					numberedContent,
					true,
					sourceLanguage,
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
					fileSlug,
					title,
					contentWithSourceTextId,
					true,
					sourceLanguage,
				);
				const userAITranslationInfo = await createUserAITranslationInfo(
					nonSanitizedUser.id,
					page.id,
					submission.value.aiModel,
					targetLanguage,
				);

				await queue.add(`translate-${nonSanitizedUser.id}`, {
					userAITranslationInfoId: userAITranslationInfo.id,
					geminiApiKey: geminiApiKey,
					aiModel: submission.value.aiModel,
					userId: nonSanitizedUser.id,
					targetLanguage,
					pageId: page.id,
					title,
					numberedContent,
					numberedElements,
				});
			}

			// ディレクトリ構造を反映したMarkdownを生成
			const directoryMarkdown = generateMarkdownFromDirectory(
				folderPath,
				fileInfos,
			);
			const markdownSlug = await generateSlug(`${folderPath}-index`);
			const directoryHtml = await marked.parse(directoryMarkdown);
			const page = await createOrUpdatePage(
				nonSanitizedUser.id,
				markdownSlug,
				folderPath,
				directoryHtml,
				true,
				"en",
			);
			const numberedElements = await extractTextElementInfo(
				directoryHtml,
				folderPath,
				page.id,
			);
			const sourceTextsIdWithNumber = await createOrUpdateSourceTexts(
				numberedElements,
				page.id,
			);
			const contentWithSourceTextId = addSourceTextIdToContent(
				directoryHtml,
				sourceTextsIdWithNumber,
			);
			await createOrUpdatePage(
				nonSanitizedUser.id,
				markdownSlug,
				folderPath,
				contentWithSourceTextId,
				true,
				"en",
			);

			slugs.push(folderSlug);
		}
	};

	if (submission.value.folder) {
		await processFolder(submission.value.folder);
	}

	return {
		lastResult: submission.reply({ resetForm: true }),
		slugs,
	};
}

export default function TranslatePage() {
	const { hasGeminiApiKey } = useLoaderData<typeof loader>();
	const revalidator = useRevalidator();

	return (
		<div>
			<div className="container mx-auto max-w-2xl min-h-50 py-10">
				<div className="pb-4">
					{hasGeminiApiKey ? (
						<TranslationInputForm />
					) : (
						"Gemini API key is not set"
					)}
				</div>
			</div>
		</div>
	);
}

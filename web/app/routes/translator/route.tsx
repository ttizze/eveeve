import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useRevalidator } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { getTranslateUserQueue } from "~/features/translate/translate-user-queue";
import { createOrUpdateSourceTexts } from "~/routes/$userName+/page+/$slug+/edit/functions/mutations.server";
import { addNumbersToContent } from "~/routes/$userName+/page+/$slug+/edit/utils/addNumbersToContent";
import { extractArticle } from "~/routes/$userName+/page+/$slug+/edit/utils/extractArticle";
import { extractNumberedElements } from "~/routes/$userName+/page+/$slug+/edit/utils/extractNumberedElements";
import { getNonSanitizedUserbyUserName } from "~/routes/functions/queries.server";
import { authenticator } from "~/utils/auth.server";
import { getTargetLanguage } from "~/utils/target-language.server";
import { TranslationInputForm } from "./components/TranslationInputForm";
import { createUserAITranslationInfo } from "./functions/mutations.server";
import { getOrCreatePage } from "./functions/mutations.server";
import { translationInputSchema } from "./types";
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
	const targetLanguage = await getTargetLanguage(request);

	return typedjson({
		currentUser,
		targetLanguage,
		hasGeminiApiKey,
	});
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

	const targetLanguage = await getTargetLanguage(request);
	const queue = getTranslateUserQueue(nonSanitizedUser.id);
	const slugs: string[] = [];

	function generateLinkArticle(
		userId: number,
		folderPath: string,
		files: { name: string; slug: string }[],
	): string {
		let article = `
			<h1>${folderPath}</h1>
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
			// ファイルのslugを非同期で生成
			const fileInfoPromises = fileList.map(async (file) => ({
				name: file.name,
				slug: await generateSlug(file.name),
			}));
			const fileInfos = await Promise.all(fileInfoPromises);

			// フォルダ内の各ファイルを処理
			for (const [index, file] of fileList.entries()) {
				const fileSlug = fileInfos[index].slug;

				const html = await file.text();

				const { content, title } = extractArticle(html);
				const numberedContent = addNumbersToContent(content);
				const page = await getOrCreatePage(
					nonSanitizedUser.id,
					fileSlug,
					title,
					numberedContent,
				);
				const userAITranslationInfo = await createUserAITranslationInfo(
					nonSanitizedUser.id,
					page.id,
					submission.value.aiModel,
					targetLanguage,
				);

				const numberedElements = await extractNumberedElements(
					numberedContent,
					title,
					null,
				);
				await createOrUpdateSourceTexts(numberedElements, page.id);
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

			// フォルダページ用のリンク記事を作成
			const linkArticle = generateLinkArticle(
				nonSanitizedUser.id,
				folderSlug,
				fileInfos,
			);
			await getOrCreatePage(
				nonSanitizedUser.id,
				folderSlug,
				folderPath,
				linkArticle,
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
	const { hasGeminiApiKey } = useTypedLoaderData<typeof loader>();
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

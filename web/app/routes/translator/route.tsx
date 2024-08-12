import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useRevalidator } from "@remix-run/react";
import { useEffect } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { addNumbersToContent } from "~/features/prepare-html-for-translate/utils/addNumbersToContent";
import { extractArticle } from "~/features/prepare-html-for-translate/utils/extractArticle";
import { extractNumberedElements } from "~/features/prepare-html-for-translate/utils/extractNumberedElements";
import { getTranslateUserQueue } from "~/features/translate/translate-user-queue";
import { authenticator } from "~/utils/auth.server";
import { getTargetLanguage } from "~/utils/target-language.server";
import { TranslationInputForm } from "./components/TranslationInputForm";
import { UserAITranslationStatus } from "./components/UserAITranslationStatus";
import { getOrCreateUserAITranslationInfo } from "./functions/mutations.server";
import { getOrCreatePage,  } from "./functions/mutations.server";
import { getDbUser } from "./functions/queries.server";
import { listUserAiTranslationInfo } from "./functions/queries.server";
import { translationInputSchema } from "./types";
import { generateSlug } from "./utils/generate-slug.server";
import { processUploadedFolder } from "./utils/process-uploaded-folder";
import { createOrUpdateSourceTexts } from "./functions/mutations.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const safeUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/fail",
	});

	const dbUser = await getDbUser(safeUser.id);
	const hasGeminiApiKey = !!dbUser?.geminiApiKey;
	const targetLanguage = await getTargetLanguage(request);
	const userAITranslationInfo = await listUserAiTranslationInfo(
		safeUser.id,
		targetLanguage,
	);

	return typedjson({
		safeUser,
		targetLanguage,
		userAITranslationInfo,
		hasGeminiApiKey,
	});
}

export async function action({ request }: ActionFunctionArgs) {
	const safeUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/",
	});

	const formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema: translationInputSchema,
	});
	if (submission.status !== "success") {
		return { lastResult: submission.reply() };
	}

	const dbUser = await getDbUser(safeUser.id);
	if (!dbUser?.geminiApiKey) {
		return {
			lastResult: submission.reply({
				formErrors: ["Gemini API key is not set"],
			}),
			slugs: [],
		};
	}

	const geminiApiKey = dbUser.geminiApiKey;

	const targetLanguage = await getTargetLanguage(request);
	const queue = getTranslateUserQueue(safeUser.id);
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
			await getOrCreateUserAITranslationInfo(
				dbUser.id,
				folderSlug,
				targetLanguage,
			);

			// ファイルのslugを非同期で生成
			const fileInfoPromises = fileList.map(async (file) => ({
				name: file.name,
				slug: await generateSlug(file.name),
			}));
			const fileInfos = await Promise.all(fileInfoPromises);

			// フォルダ内の各ファイルを処理
			for (const [index, file] of fileList.entries()) {
				const fileSlug = fileInfos[index].slug;
				await getOrCreateUserAITranslationInfo(
					dbUser.id,
					fileSlug,
					targetLanguage,
				);

				const html = await file.text();

				const { content, title } = extractArticle(html);
				const numberedContent = addNumbersToContent(content);
				const page = await getOrCreatePage(safeUser.id, fileSlug, title, numberedContent);
				const numberedElements = extractNumberedElements(numberedContent);
				await createOrUpdateSourceTexts(numberedElements, page.id);
				// ファイルの翻訳ジョブをキューに追加
				await queue.add(`translate-${safeUser.id}`, {
					geminiApiKey: geminiApiKey,
					aiModel: submission.value.aiModel,
					userId: safeUser.id,
					targetLanguage,
					pageId: page.id,
					title,
					numberedContent,
					numberedElements,
					slug: fileSlug,
				});
			}

			// フォルダページ用のリンク記事を作成
			const linkArticle = generateLinkArticle(
				safeUser.id,
				folderSlug,
				fileInfos,
			);
			await getOrCreatePage(dbUser.id, folderSlug, folderPath, linkArticle);

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
	const {  targetLanguage, userAITranslationInfo, hasGeminiApiKey } =
		useTypedLoaderData<typeof loader>();
	const revalidator = useRevalidator();

	useEffect(() => {
		const intervalId = setInterval(() => {
			revalidator.revalidate();
		}, 5000);

		return () => clearInterval(intervalId);
	}, [revalidator]);

	return (
		<div>
			<div className="container mx-auto max-w-2xl min-h-50 py-10">
				<div className="pb-4">
					{hasGeminiApiKey ? <TranslationInputForm /> : "Gemini API key is not set"}
				</div>
				<div>
					<h2 className="text-2xl font-bold">Translation history</h2>
					<div>
						<UserAITranslationStatus
							userAITranslationInfo={userAITranslationInfo}
							targetLanguage={targetLanguage}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

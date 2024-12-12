import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import fm from "front-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import { getUserByUserName } from "~/routes/$userName+/edit/functions/queries.server";
import {
	createOrUpdatePage,
	createOrUpdateSourceTexts,
	upsertTags,
} from "~/routes/$userName+/page+/$slug+/edit/functions/mutations.server";
import {
	getPageBySlug,
	getTitleSourceTextId,
} from "~/routes/$userName+/page+/$slug+/edit/functions/queries.server";
import { addNumbersToContent } from "~/routes/$userName+/page+/$slug+/edit/utils/addNumbersToContent";
import { addSourceTextIdToContent } from "~/routes/$userName+/page+/$slug+/edit/utils/addSourceTextIdToContent";
import { extractTextElementInfo } from "~/routes/$userName+/page+/$slug+/edit/utils/extractTextElementInfo";
import { getPageSourceLanguage } from "~/routes/$userName+/page+/$slug+/edit/utils/getPageSourceLanguage";
import { removeSourceTextIdDuplicatesAndEmptyElements } from "~/routes/$userName+/page+/$slug+/edit/utils/removeSourceTextIdDuplicates";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? "";
const GITHUB_REPO = process.env.GITHUB_REPO ?? "";
const GITHUB_OWNER = process.env.GITHUB_OWNER ?? "";

if (!GITHUB_TOKEN || !GITHUB_REPO || !GITHUB_OWNER) {
	throw new Error(
		"GitHub環境変数(GITHUB_TOKEN, GITHUB_REPO, GITHUB_OWNER)が設定されていません",
	);
}

const REPO_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}.git`;
const CLONE_DIR = path.join(process.cwd(), "temp-repo");
const SKIP_FILES = ["readme.md"];


async function syncMarkdown() {
	try {
		// 既存のディレクトリがあれば削除
		if (fs.existsSync(CLONE_DIR)) {
			fs.rmSync(CLONE_DIR, { recursive: true, force: true });
		}

		console.log("リポジトリをクローン中...");
		execSync(`git clone ${REPO_URL} ${CLONE_DIR}`, { stdio: "inherit" });

		const markdownFiles = getAllMarkdownFiles(CLONE_DIR);
		console.log(`${markdownFiles.length} 個のMarkdownファイルを検出`);

		for (const filePath of markdownFiles) {
			const fileName = path.basename(filePath).toLowerCase();
			if (SKIP_FILES.includes(fileName)) {
				console.log(`スキップ: ${filePath}`);
				continue;
			}

			try {
				const rawMarkdown = fs.readFileSync(filePath, "utf-8");
				const { attributes, body } = fm<{
					tags?: string[];
					slug: string;
					author?: string;
				}>(rawMarkdown);

				if (!attributes.slug) {
					console.error("slugがfront-matter内に存在しません:", filePath);
					continue;
				}

				const tags = attributes.tags?.map((tag) => `NDC${tag}`);
				const title = path.basename(filePath, ".md");
				const author = attributes.author;
				const slug = attributes.slug;

				const existPage = await getPageBySlug(slug);
				if (existPage) {
					// 既存ページがある場合はtagsのみ更新
					if (tags) {
						await upsertTags(tags, existPage.id);
					}
					console.log("既存ページ:", slug, "更新なし");
				} else {
					const authorHeader = author ? `## author:${author}\n\n` : "";
					const modifiedBody = authorHeader + body;

					const titleSourceTextId = await getTitleSourceTextId(slug);

					const processed = await remark()
						.use(remarkGfm)
						.use(remarkHtml)
						.process(modifiedBody);
					const htmlContent = processed.toString();

					const numberedContent =
						await removeSourceTextIdDuplicatesAndEmptyElements(
							addNumbersToContent(htmlContent),
						);

					const textElements = await extractTextElementInfo(
						numberedContent,
						title,
						titleSourceTextId,
					);
					const sourceLanguage = await getPageSourceLanguage(
						numberedContent,
						title,
					);
					const adminUser = await getUserByUserName("evame");
					if (!adminUser) {
						throw new Error("管理者ユーザーが見つかりません");
					}

					const page = await createOrUpdatePage(
						adminUser.id,
						slug,
						title,
						numberedContent,
						true,
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
						adminUser.id,
						slug,
						title,
						contentWithSourceTextId,
						true,
						sourceLanguage,
					);

					console.log("新規ページを作成:", slug);
				}

				console.log(`✅ 処理完了: ${filePath}`);
			} catch (error) {
				console.error(`❌ エラー (${filePath}):`, error);
			}

			// レートリミット対策の待機
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	} catch (error) {
		console.error("エラー:", error);
	} finally {
		// クリーンアップ
		if (fs.existsSync(CLONE_DIR)) {
			fs.rmSync(CLONE_DIR, { recursive: true, force: true });
		}
	}
}

// 指定ディレクトリ以下の全ての.mdファイルを再帰的に取得
function getAllMarkdownFiles(dir: string): string[] {
	let results: string[] = [];
	const list = fs.readdirSync(dir, { withFileTypes: true });
	for (const file of list) {
		const fullPath = path.join(dir, file.name);
		if (file.isDirectory()) {
			results = results.concat(getAllMarkdownFiles(fullPath));
		} else if (file.name.endsWith(".md")) {
			results.push(fullPath);
		}
	}
	return results;
}

(async () => {
	await syncMarkdown();
})();

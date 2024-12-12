import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import fm from "front-matter";
import { JSDOM } from "jsdom"; // HTMLパース用
import pLimit from "p-limit";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GITHUB_REPO = process.env.GITHUB_REPO ?? "";
const GITHUB_OWNER = process.env.GITHUB_OWNER ?? "";

if (!GITHUB_REPO || !GITHUB_OWNER) {
	throw new Error(
		"GitHub環境変数(GITHUB_TOKEN, GITHUB_REPO, GITHUB_OWNER)が設定されていません",
	);
}

const REPO_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}.git`;
const CLONE_DIR = path.join(process.cwd(), "temp-repo");
const SKIP_FILES = ["readme.md"];

type RankingEntry = {
	rank: number;
	title: string;
	author: string;
	link: string;
};

function getRankingEntries(htmlFilePath: string): RankingEntry[] {
	const htmlContent = fs.readFileSync(htmlFilePath, "utf-8");
	const dom = new JSDOM(htmlContent);
	const document = dom.window.document;
	const rows = Array.from(document.querySelectorAll("table.list tr")).slice(1);
	const entries: RankingEntry[] = [];
	for (const row of rows) {
		const tds = Array.from(row.querySelectorAll("td.normal"));
		if (tds.length < 4) continue;
		const rankText = tds[0].textContent?.trim() ?? "";
		const aEl = tds[1].querySelector("a[target=_blank]");
		const titleText =
			aEl?.textContent?.trim().replace(/\r?\n/g, "").trim() ?? "";
		const link = aEl?.getAttribute("href") ?? "";
		const authorA = tds[2].querySelector("a");
		const authorText = authorA?.textContent?.trim() ?? "";

		const rankNum = Number.parseInt(rankText, 10);
		if (!Number.isNaN(rankNum) && titleText) {
			entries.push({
				rank: rankNum,
				title: titleText,
				author: authorText,
				link,
			});
		}
	}
	return entries;
}

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

async function syncMarkdown() {
	// タイトル→slugマップ
	const titleToSlugMap = new Map<string, string>();

	try {
		const htmlFilePath = join(__dirname, "ranking.html");
		if (!fs.existsSync(htmlFilePath)) {
			throw new Error("ranking.htmlが見つかりません");
		}
		const rankingEntries = getRankingEntries(htmlFilePath);
		const titlesFromHtml = new Set(rankingEntries.map((e) => e.title));

		if (!fs.existsSync(CLONE_DIR)) {
			console.log("リポジトリをクローン中...");
			execSync(`git clone ${REPO_URL} ${CLONE_DIR}`, { stdio: "inherit" });
		} else {
			console.log("既にリポジトリが存在します:", CLONE_DIR);
		}

		const markdownFiles = getAllMarkdownFiles(CLONE_DIR);
		console.log(`${markdownFiles.length} 個のMarkdownファイルを検出`);

		const limit = pLimit(10);
		await Promise.all(
			markdownFiles.map((filePath) =>
				limit(async () => {
					const fileName = path.basename(filePath).toLowerCase();
					if (SKIP_FILES.includes(fileName)) {
						return;
					}

					try {
						const rawMarkdown = fs.readFileSync(filePath, "utf-8");
						const { attributes, body } = fm<{
							tags?: string[];
							slug: string;
							author?: string;
						}>(rawMarkdown);

						if (!attributes.slug) {
							console.error("slugがありません:", filePath);
							return;
						}

						const title = path.basename(filePath, ".md");
						if (!titlesFromHtml.has(title)) {
							return;
						}
						const slug = attributes.slug;
						titleToSlugMap.set(title, slug);

						const tags = attributes.tags?.map((tag) => `NDC${tag}`);

						const existPage = await getPageBySlug(slug);
						if (existPage) {
							if (tags) {
								await upsertTags(tags, existPage.id);
							}
							console.log("既存ページ:", slug, "更新なし");
						} else {
							const titleSourceTextId = await getTitleSourceTextId(slug);

							const processed = await remark()
								.use(remarkGfm)
								.use(remarkHtml)
								.process(body);
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
					} catch (error) {
						console.error(`❌ エラー (${filePath}):`, error);
					}
				}),
			),
		);

		// ランキングページMarkdown生成
		// タイトルや他ページのslugリンクをMarkdown形式で記述
		const rankingPageSlug = "aozorabunko-popularity-ranking";
		const rankingTitle = "人気ランキングページ";
		// Markdown例:
		// # 人気ランキングページ
		// 1. [作品タイトル](https://example.com/pages/SLUG) - 著者名
		// 2. [作品タイトル](...)
		// ...
		let rankingMarkdown = `## ${rankingTitle}\n\n`;
		for (const entry of rankingEntries) {
			const pageSlug = titleToSlugMap.get(entry.title);
			if (pageSlug) {
				// 内部リンクの場合: /pages/${pageSlug}
				// HTML化後は <a href="/pages/${pageSlug}">...</a> になる
				rankingMarkdown += `${entry.rank}. [${entry.title}](/evame/page/${pageSlug}) - ${entry.author}\n`;
			} else {
				// slug未登録作品はリンクなし
				rankingMarkdown += `${entry.rank}. ${entry.title} - ${entry.author}\n`;
			}
		}

		const adminUser = await getUserByUserName("evame");
		if (!adminUser) {
			throw new Error("管理者ユーザーが見つかりません(ランキングページ生成時)");
		}

		const titleSourceTextId = await getTitleSourceTextId(rankingPageSlug);
		const processedRanking = await remark()
			.use(remarkGfm)
			.use(remarkHtml)
			.process(rankingMarkdown);
		const rankingHtmlContent = processedRanking.toString();

		const numberedContentForRanking =
			await removeSourceTextIdDuplicatesAndEmptyElements(
				addNumbersToContent(rankingHtmlContent),
			);

		const textElementsForRanking = await extractTextElementInfo(
			numberedContentForRanking,
			rankingTitle,
			titleSourceTextId,
		);
		const sourceLanguage = "ja";

		const rankingPage = await createOrUpdatePage(
			adminUser.id,
			rankingPageSlug,
			rankingTitle,
			numberedContentForRanking,
			true,
			sourceLanguage,
		);

		const sourceTextsIdWithNumberRanking = await createOrUpdateSourceTexts(
			textElementsForRanking,
			rankingPage.id,
		);
		const contentWithSourceTextIdRanking = addSourceTextIdToContent(
			numberedContentForRanking,
			sourceTextsIdWithNumberRanking,
		);

		await createOrUpdatePage(
			adminUser.id,
			rankingPageSlug,
			rankingTitle,
			contentWithSourceTextIdRanking,
			true,
			sourceLanguage,
		);

		console.log("ランキングページを作成しました:", rankingPageSlug);
	} catch (error) {
		console.error("エラー:", error);
	} finally {
		console.log("クローンリポジトリは保持されます:", CLONE_DIR);
	}
}

(async () => {
	await syncMarkdown();
})();

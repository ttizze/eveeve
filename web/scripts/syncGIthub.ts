import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import fm from "front-matter";
import pLimit from "p-limit";
import { upsertTags } from "~/routes/$userName+/page+/$slug+/edit/functions/mutations.server";
import { processMarkdownContent } from "./syncMarkdown";

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
	const htmlFilePath = join(__dirname, "ranking.html");
	if (!fs.existsSync(htmlFilePath)) {
		throw new Error("ranking.htmlが見つかりません");
	}

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

					const slug = attributes.slug;
					const title = path.basename(filePath, ".md");

					// 登録・編集フロー
					const page = await processMarkdownContent(body, slug);

					// タグの処理例 (既存のアップサートなど)
					if (attributes.tags && page && page.id) {
						const tags = attributes.tags.map((tag) => `NDC${tag}`);
						await upsertTags(tags, page.id);
					}

					console.log("処理完了:", slug);
				} catch (error) {
					console.error(`❌ エラー (${filePath}):`, error);
				}
			}),
		),
	);
}

(async () => {
	await syncMarkdown();
})();

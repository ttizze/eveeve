import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import fm from "front-matter";
import pLimit from "p-limit";
import { upsertTags } from "~/routes/$userName+/page+/$slug+/edit/functions/mutations.server";
import { prisma } from "~/utils/prisma";
import { processMarkdownContent } from "./processMarkdownContent";

// 定数の定義
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GITHUB_REPO = process.env.GITHUB_REPO ?? "";
const GITHUB_OWNER = process.env.GITHUB_OWNER ?? "";

if (!GITHUB_REPO || !GITHUB_OWNER) {
	throw new Error(
		"GitHub環境変数(GITHUB_REPO, GITHUB_OWNER)が設定されていません",
	);
}

const REPO_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}.git`;
const CLONE_DIR = path.join(process.cwd(), "temp-repo");
const SKIP_FILES = ["readme.md"];

/**
 * リポジトリのクローンまたは最新化
 */
async function cloneOrUpdateRepo() {
	try {
		if (!(await directoryExists(CLONE_DIR))) {
			console.log("リポジトリをクローン中...");
			execSync(`git clone ${REPO_URL} ${CLONE_DIR}`, { stdio: "inherit" });
		} else {
			console.log("既にリポジトリが存在します。最新化中...");
			execSync(`git -C ${CLONE_DIR} pull`, { stdio: "inherit" });
		}
	} catch (error) {
		console.error(
			"リポジトリのクローンまたは更新中にエラーが発生しました:",
			error,
		);
		throw error;
	}
}

/**
 * ディレクトリの存在確認
 * @param dir パス
 */
async function directoryExists(dir: string): Promise<boolean> {
	try {
		const stats = await fs.stat(dir);
		return stats.isDirectory();
	} catch {
		return false;
	}
}

/**
 * 全てのMarkdownファイルを再帰的に取得
 * @param dir ディレクトリパス
 */
async function getAllMarkdownFiles(dir: string): Promise<string[]> {
	let results: string[] = [];
	try {
		const list = await fs.readdir(dir, { withFileTypes: true });
		for (const file of list) {
			const fullPath = path.join(dir, file.name);
			if (file.isDirectory()) {
				results = results.concat(await getAllMarkdownFiles(fullPath));
			} else if (file.name.toLowerCase().endsWith(".md")) {
				results.push(fullPath);
			}
		}
	} catch (error) {
		console.error(
			`ディレクトリの読み込み中にエラーが発生しました (${dir}):`,
			error,
		);
	}
	return results;
}

/**
 * ファイルがスキップ対象か確認
 * @param fileName ファイル名
 */
function shouldSkipFile(fileName: string): boolean {
	return SKIP_FILES.includes(fileName.toLowerCase());
}

/**
 * Markdownファイルを処理
 * @param filePath ファイルパス
 */
async function processMarkdownFile(filePath: string) {
	const fileName = path.basename(filePath).toLowerCase();
	if (shouldSkipFile(fileName)) {
		console.log(`スキップ: ${filePath}`);
		return;
	}

	try {
		const rawMarkdown = await fs.readFile(filePath, "utf-8");
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

		// 管理者ユーザーの取得
		const adminUser = await prisma.user.findUnique({
			where: { userName: "evame" },
		});
		if (!adminUser) {
			throw new Error("adminユーザーが見つかりません");
		}

		// Markdownコンテンツの処理
		const page = await processMarkdownContent(
			title,
			body,
			slug,
			adminUser.id,
			"en",
			true,
		);

		// タグのアップサート
		if (attributes.tags && page && page.id) {
			const tags = attributes.tags.map((tag) => `NDC${tag}`);
			await upsertTags(tags, page.id);
		}

		console.log("処理完了:", slug);
	} catch (error) {
		console.error(`❌ エラー (${filePath}):`, error);
	}
}

/**
 * Markdownの同期処理
 */
async function syncGithub() {
	try {
		// 必要なファイルの存在確認
		const htmlFilePath = join(__dirname, "ranking.html");
		try {
			await fs.access(htmlFilePath);
		} catch {
			throw new Error("ranking.htmlが見つかりません");
		}

		// リポジトリのクローンまたは更新
		await cloneOrUpdateRepo();

		// Markdownファイルの取得
		const markdownFiles = await getAllMarkdownFiles(CLONE_DIR);
		console.log(`${markdownFiles.length} 個のMarkdownファイルを検出`);

		// 並列処理の制限
		const limit = pLimit(10);

		// ファイルの処理
		await Promise.all(
			markdownFiles.map((filePath) =>
				limit(() => processMarkdownFile(filePath)),
			),
		);
	} catch (error) {
		console.error("Markdownの同期中にエラーが発生しました:", error);
	}
}

// 実行部分
(async () => {
	await syncGithub();
})();

import { Octokit } from "@octokit/rest";
import fm from "front-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import slugify from "@sindresorhus/slugify";
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
import unidecode from "unidecode";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? "";
const GITHUB_REPO = process.env.GITHUB_REPO ?? "";
const GITHUB_OWNER = process.env.GITHUB_OWNER ?? "";

if (!GITHUB_TOKEN || !GITHUB_REPO || !GITHUB_OWNER) {
	throw new Error("GitHub configuration is not set in environment variables");
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function getAllMarkdownFiles(
	owner: string,
	repo: string,
	path = "",
): Promise<Array<{ path: string; name: string }>> {
	const { data: contents } = await octokit.repos.getContent({
		owner,
		repo,
		path,
	});

	if (!Array.isArray(contents)) {
		throw new Error(`Unable to fetch repository contents at path: ${path}`);
	}

	const markdownFiles: { path: string; name: string }[] = [];

	for (const item of contents) {
		if (item.type === "file" && item.name.endsWith(".md")) {
			markdownFiles.push({ path: item.path, name: item.name });
		} else if (item.type === "dir") {
			// ディレクトリなら再帰的に探索
			const nestedFiles = await getAllMarkdownFiles(owner, repo, item.path);
			markdownFiles.push(...nestedFiles);
		}
	}

	return markdownFiles;
}
try {
	const markdownFiles = await getAllMarkdownFiles(GITHUB_OWNER, GITHUB_REPO);

	// Process each markdown file
	for (const file of markdownFiles) {
		const { data: fileContent } = await octokit.repos.getContent({
			owner: GITHUB_OWNER,
			repo: GITHUB_REPO,
			path: file.path,
		});
		if ("content" in fileContent) {
			const rawMarkdown = Buffer.from(fileContent.content, "base64").toString();

			const { attributes, body } = fm<{
				tags?: string[];
			}>(rawMarkdown);
			const { tags: originalTags } = attributes;
			//aozorabunkoはNDCにする
			console.log(file.path);
			const tags = originalTags?.map((tag) => `NDC${tag}`);
			const title = file.name.replace(".md", "");
			const asciiApproximated = unidecode(title);
			const slug = slugify(asciiApproximated, {
				separator: "",
				lowercase: false,
			});
			const existPage = await getPageBySlug(slug);
			if (existPage) {
				//pagesやtextは編集するとバグるが､tagsは編集できるので､tagsを更新する
				if (tags) {
					console.log(tags);
					await upsertTags(tags, existPage.id);
				}
				console.log("Page already exists:", slug);
				continue;
			}
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
				throw Error;
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
		}
	}
} catch (error) {
	console.error("Error syncing markdown files:", error);
}

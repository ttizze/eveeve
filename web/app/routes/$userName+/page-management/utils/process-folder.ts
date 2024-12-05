import { processUploadedFolder } from "./process-uploaded-folder";
import { marked } from "marked";
import { createUserAITranslationInfo } from "../functions/mutations.server";
import { createOrUpdateSourceTexts } from "../../page+/$slug+/edit/functions/mutations.server";
import { createOrUpdatePage } from "../../page+/$slug+/edit/functions/mutations.server";
import { getTitleSourceTextId } from "../../page+/$slug+/edit/functions/queries.server";
import { addNumbersToContent } from "../../page+/$slug+/edit/utils/addNumbersToContent";
import { addSourceTextIdToContent } from "../../page+/$slug+/edit/utils/addSourceTextIdToContent";
import { extractArticle } from "../../page+/$slug+/edit/utils/extractArticle";
import { extractTextElementInfo } from "../../page+/$slug+/edit/utils/extractTextElementInfo";
import { getPageSourceLanguage } from "../../page+/$slug+/edit/utils/getPageSourceLanguage";
import { generateMarkdownFromDirectory } from "./generate-markdown";
import { generateSlug } from "./generate-slug.server";
import type { User } from "@prisma/client";
import type { Queue } from "bullmq";

export const processFolder = async (folder: File[], nonSanitizedUser: User, aiModel: string, targetLanguage: string, queue: Queue) => {
  const folderStructure = processUploadedFolder(folder);
  const slugs: string[] = [];
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
        nonSanitizedUser.id,
        fileSlug,
        title,
        contentWithSourceTextId,
        true,
        sourceLanguage,
      );
      const userAITranslationInfo = await createUserAITranslationInfo(
        nonSanitizedUser.id,
        page.id,
        aiModel,
        targetLanguage,
      );

      await queue.add(`translate-${nonSanitizedUser.id}`, {
        userAITranslationInfoId: userAITranslationInfo.id,
        geminiApiKey: nonSanitizedUser.geminiApiKey,
        aiModel,
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
  return slugs;
};
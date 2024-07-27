import { PrismaClient } from "@prisma/client";
import { normalizeAndSanitizeUrl } from "../app/utils/normalize-and-sanitize-url.server";

const prisma = new PrismaClient();

async function normalizeUrls() {
  const batchSize = 100;
  let processedPageCount = 0;
  let processedPageVersionCount = 0;

  try {
    // Normalize Page URLs
    while (true) {
      const pages = await prisma.page.findMany({
        take: batchSize,
        skip: processedPageCount,
        select: { id: true, url: true },
      });

      if (pages.length === 0) break;

      for (const page of pages) {
        const normalizedUrl = normalizeAndSanitizeUrl(page.url);
        if (normalizedUrl !== page.url) {
          await prisma.page.update({
            where: { id: page.id },
            data: { url: normalizedUrl },
          });
          console.log(`Updated Page URL: ${page.url} -> ${normalizedUrl}`);
        }
      }

      processedPageCount += pages.length;
      console.log(`Processed ${processedPageCount} pages`);
    }

    // Normalize PageVersion URLs
    while (true) {
      const pageVersions = await prisma.pageVersion.findMany({
        take: batchSize,
        skip: processedPageVersionCount,
        select: { id: true, url: true },
      });

      if (pageVersions.length === 0) break;

      for (const pageVersion of pageVersions) {
        const normalizedUrl = normalizeAndSanitizeUrl(pageVersion.url);
        if (normalizedUrl !== pageVersion.url) {
          await prisma.pageVersion.update({
            where: { id: pageVersion.id },
            data: { url: normalizedUrl },
          });
          console.log(`Updated PageVersion URL: ${pageVersion.url} -> ${normalizedUrl}`);
        }
      }

      processedPageVersionCount += pageVersions.length;
      console.log(`Processed ${processedPageVersionCount} page versions`);
    }

    console.log("URL normalization complete");
  } catch (error) {
    console.error("Error during URL normalization:", error);
  } finally {
    await prisma.$disconnect();
  }
}

normalizeUrls();
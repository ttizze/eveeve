/*
  Warnings:

  - You are about to drop the `_PageVersionToSourceText` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PageVersionToSourceText" DROP CONSTRAINT "_PageVersionToSourceText_A_fkey";

-- DropForeignKey
ALTER TABLE "_PageVersionToSourceText" DROP CONSTRAINT "_PageVersionToSourceText_B_fkey";

-- DropTable
DROP TABLE "_PageVersionToSourceText";

-- AddForeignKey
ALTER TABLE "source_texts" ADD CONSTRAINT "source_texts_page_version_id_fkey" FOREIGN KEY ("page_version_id") REFERENCES "page_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

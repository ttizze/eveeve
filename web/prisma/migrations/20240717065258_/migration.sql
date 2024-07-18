/*
  Warnings:

  - A unique constraint covering the columns `[url,content_hash]` on the table `page_versions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "page_versions_url_created_at_key";

-- CreateIndex
CREATE UNIQUE INDEX "page_versions_url_content_hash_key" ON "page_versions"("url", "content_hash");

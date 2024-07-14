/*
  Warnings:

  - You are about to drop the column `fetchedAt` on the `page_versions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[url,created_at]` on the table `page_versions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "page_versions_url_fetchedAt_key";

-- AlterTable
ALTER TABLE "page_versions" DROP COLUMN "fetchedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "page_versions_url_created_at_key" ON "page_versions"("url", "created_at");

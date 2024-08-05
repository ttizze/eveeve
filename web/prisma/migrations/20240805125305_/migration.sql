/*
  Warnings:

  - You are about to drop the column `page_version_id` on the `page_version_source_texts` table. All the data in the column will be lost.
  - You are about to drop the column `page_version_id` on the `page_version_translation_info` table. All the data in the column will be lost.
  - You are about to drop the column `page_version_id` on the `user_ai_translation_info` table. All the data in the column will be lost.
  - You are about to drop the column `page_version_id` on the `user_read_history` table. All the data in the column will be lost.
  - You are about to drop the `page_versions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[page_id,source_text_id]` on the table `page_version_source_texts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[page_id,target_language]` on the table `page_version_translation_info` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,page_id,target_language]` on the table `user_ai_translation_info` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,page_id]` on the table `user_read_history` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `page_id` to the `page_version_source_texts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `page_id` to the `page_version_translation_info` table without a default value. This is not possible if the table is not empty.
  - Added the required column `page_id` to the `user_ai_translation_info` table without a default value. This is not possible if the table is not empty.
  - Added the required column `page_id` to the `user_read_history` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "page_version_source_texts" DROP CONSTRAINT "page_version_source_texts_page_version_id_fkey";

-- DropForeignKey
ALTER TABLE "page_version_translation_info" DROP CONSTRAINT "page_version_translation_info_page_version_id_fkey";

-- DropForeignKey
ALTER TABLE "user_ai_translation_info" DROP CONSTRAINT "user_ai_translation_info_page_version_id_fkey";

-- DropForeignKey
ALTER TABLE "user_read_history" DROP CONSTRAINT "user_read_history_page_version_id_fkey";

-- DropIndex
DROP INDEX "page_version_source_texts_page_version_id_idx";

-- DropIndex
DROP INDEX "page_version_source_texts_page_version_id_source_text_id_key";

-- DropIndex
DROP INDEX "page_version_translation_info_page_version_id_target_langua_key";

-- DropIndex
DROP INDEX "user_ai_translation_info_page_version_id_idx";

-- DropIndex
DROP INDEX "user_ai_translation_info_user_id_page_version_id_target_lan_key";

-- DropIndex
DROP INDEX "user_read_history_page_version_id_idx";

-- DropIndex
DROP INDEX "user_read_history_user_id_page_version_id_key";

-- AlterTable
-- AlterTable
ALTER TABLE "page_version_source_texts" RENAME COLUMN "page_version_id" TO "page_id";

-- AlterTable
ALTER TABLE "page_version_translation_info" RENAME COLUMN "page_version_id" TO "page_id";

-- AlterTable
ALTER TABLE "user_ai_translation_info" RENAME COLUMN "page_version_id" TO "page_id";

-- AlterTable
ALTER TABLE "user_read_history" RENAME COLUMN "page_version_id" TO "page_id";


-- CreateTable
CREATE TABLE "pages" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "license" TEXT NOT NULL DEFAULT 'unknown',
    "content_hash" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);
-- 3. データを新しいテーブルに移行
INSERT INTO pages (id, url, title, content, content_hash, created_at)
SELECT id, url, title, content, content_hash, created_at
FROM page_versions;
-- DropTable
DROP TABLE "page_versions";

-- CreateIndex
CREATE UNIQUE INDEX "pages_url_content_hash_key" ON "pages"("url", "content_hash");

-- CreateIndex
CREATE INDEX "page_version_source_texts_page_id_idx" ON "page_version_source_texts"("page_id");

-- CreateIndex
CREATE UNIQUE INDEX "page_version_source_texts_page_id_source_text_id_key" ON "page_version_source_texts"("page_id", "source_text_id");

-- CreateIndex
CREATE UNIQUE INDEX "page_version_translation_info_page_id_target_language_key" ON "page_version_translation_info"("page_id", "target_language");

-- CreateIndex
CREATE UNIQUE INDEX "user_ai_translation_info_user_id_page_id_target_language_key" ON "user_ai_translation_info"("user_id", "page_id", "target_language");

-- CreateIndex
CREATE INDEX "user_read_history_page_id_idx" ON "user_read_history"("page_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_read_history_user_id_page_id_key" ON "user_read_history"("user_id", "page_id");

-- AddForeignKey
ALTER TABLE "user_ai_translation_info" ADD CONSTRAINT "user_ai_translation_info_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_read_history" ADD CONSTRAINT "user_read_history_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_version_translation_info" ADD CONSTRAINT "page_version_translation_info_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_version_source_texts" ADD CONSTRAINT "page_version_source_texts_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

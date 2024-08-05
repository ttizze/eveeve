/*
  Warnings:

  - You are about to drop the column `page_id` on the `user_ai_translation_info` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,url,target_language]` on the table `user_ai_translation_info` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "user_ai_translation_info" DROP CONSTRAINT "user_ai_translation_info_page_id_fkey";

-- DropIndex
DROP INDEX "user_ai_translation_info_user_id_page_id_target_language_key";

-- AlterTable
ALTER TABLE "user_ai_translation_info" ADD COLUMN "url" TEXT NOT NULL DEFAULT 'unknown';
UPDATE user_ai_translation_info uati
SET url = p.url
FROM pages p
WHERE uati.page_id = p.id;

ALTER TABLE "user_ai_translation_info" DROP COLUMN "page_id";

-- CreateIndex
CREATE UNIQUE INDEX "user_ai_translation_info_user_id_url_target_language_key" ON "user_ai_translation_info"("user_id", "url", "target_language");

/*
  Warnings:

  - You are about to drop the column `url` on the `user_ai_translation_info` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,slug,target_language]` on the table `user_ai_translation_info` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "user_ai_translation_info_user_id_url_target_language_key";

-- AlterTable
ALTER TABLE "user_ai_translation_info" RENAME COLUMN "url" TO "slug";
-- CreateIndex
CREATE UNIQUE INDEX "user_ai_translation_info_user_id_slug_target_language_key" ON "user_ai_translation_info"("user_id", "slug", "target_language");

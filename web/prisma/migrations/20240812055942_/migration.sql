/*
  Warnings:

  - You are about to drop the column `slug` on the `user_ai_translation_info` table. All the data in the column will be lost.
  - Added the required column `ai_model` to the `user_ai_translation_info` table without a default value. This is not possible if the table is not empty.
  - Added the required column `page_id` to the `user_ai_translation_info` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "user_ai_translation_info_user_id_slug_target_language_key";

-- AlterTable
ALTER TABLE "user_ai_translation_info" DROP COLUMN "slug",
ADD COLUMN     "ai_model" TEXT NOT NULL,
ADD COLUMN     "page_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "user_ai_translation_info_page_id_target_language_idx" ON "user_ai_translation_info"("page_id", "target_language");

-- AddForeignKey
ALTER TABLE "user_ai_translation_info" ADD CONSTRAINT "user_ai_translation_info_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

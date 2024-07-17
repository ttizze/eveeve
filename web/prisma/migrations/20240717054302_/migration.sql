/*
  Warnings:

  - You are about to drop the column `translation_progress` on the `page_version_translation_info` table. All the data in the column will be lost.
  - You are about to drop the column `translation_status` on the `page_version_translation_info` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "page_version_translation_info" DROP COLUMN "translation_progress",
DROP COLUMN "translation_status";

-- CreateTable
CREATE TABLE "user_translation_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "page_version_id" INTEGER NOT NULL,
    "target_language" TEXT NOT NULL,
    "ai_translation_status" TEXT NOT NULL DEFAULT 'pending',
    "ai_translation_progress" INTEGER NOT NULL DEFAULT 0,
    "last_translated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_translation_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_translation_history_user_id_idx" ON "user_translation_history"("user_id");

-- CreateIndex
CREATE INDEX "user_translation_history_page_version_id_idx" ON "user_translation_history"("page_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_translation_history_user_id_page_version_id_target_lan_key" ON "user_translation_history"("user_id", "page_version_id", "target_language");

-- AddForeignKey
ALTER TABLE "user_translation_history" ADD CONSTRAINT "user_translation_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_translation_history" ADD CONSTRAINT "user_translation_history_page_version_id_fkey" FOREIGN KEY ("page_version_id") REFERENCES "page_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

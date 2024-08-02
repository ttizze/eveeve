ALTER TABLE "user_translation_history" RENAME TO "user_ai_translation_info";
-- AlterTable
ALTER TABLE "user_ai_translation_info" RENAME CONSTRAINT "user_translation_history_pkey" TO "user_ai_translation_info_pkey";

-- RenameForeignKey
ALTER TABLE "user_ai_translation_info" RENAME CONSTRAINT "user_translation_history_page_version_id_fkey" TO "user_ai_translation_info_page_version_id_fkey";

-- RenameForeignKey
ALTER TABLE "user_ai_translation_info" RENAME CONSTRAINT "user_translation_history_user_id_fkey" TO "user_ai_translation_info_user_id_fkey";

-- RenameIndex
ALTER INDEX "user_translation_history_page_version_id_idx" RENAME TO "user_ai_translation_info_page_version_id_idx";

-- RenameIndex
ALTER INDEX "user_translation_history_user_id_idx" RENAME TO "user_ai_translation_info_user_id_idx";

-- RenameIndex
ALTER INDEX "user_translation_history_user_id_page_version_id_target_lan_key" RENAME TO "user_ai_translation_info_user_id_page_version_id_target_lan_key";

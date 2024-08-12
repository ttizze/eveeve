/*
  Warnings:

  - You are about to drop the column `last_translated_at` on the `user_ai_translation_info` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_ai_translation_info" DROP COLUMN "last_translated_at",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

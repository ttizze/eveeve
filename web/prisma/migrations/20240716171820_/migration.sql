/*
  Warnings:

  - You are about to drop the column `language` on the `translate_texts` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `translation_status` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `translation_status` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[page_version_id,target_language]` on the table `translation_status` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `targetLanguage` to the `translate_texts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target_language` to the `translation_status` table without a default value. This is not possible if the table is not empty.
  - Added the required column `translation_title` to the `translation_status` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "translation_status_page_version_id_language_key";

-- AlterTable
ALTER TABLE "translate_texts" DROP COLUMN "language",
ADD COLUMN     "targetLanguage" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "translation_status" DROP COLUMN "language",
DROP COLUMN "title",
ADD COLUMN     "target_language" TEXT NOT NULL,
ADD COLUMN     "translation_title" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "translation_status_page_version_id_target_language_key" ON "translation_status"("page_version_id", "target_language");

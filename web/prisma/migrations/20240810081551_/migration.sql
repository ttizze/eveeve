/*
  Warnings:

  - You are about to drop the column `number` on the `source_texts` table. All the data in the column will be lost.
  - You are about to drop the column `text_hash` on the `source_texts` table. All the data in the column will be lost.
  - You are about to drop the column `edit_count` on the `translate_texts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[page_id]` on the table `source_texts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "source_texts_text_hash_number_page_id_idx";

-- DropIndex
DROP INDEX "source_texts_text_hash_number_page_id_key";

-- AlterTable
ALTER TABLE "source_texts" DROP COLUMN "number",
DROP COLUMN "text_hash";

-- AlterTable
ALTER TABLE "translate_texts" DROP COLUMN "edit_count";

-- CreateIndex
CREATE UNIQUE INDEX "source_texts_page_id_key" ON "source_texts"("page_id");

-- CreateIndex
CREATE INDEX "source_texts_page_id_idx" ON "source_texts"("page_id");

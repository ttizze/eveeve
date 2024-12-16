/*
  Warnings:

  - You are about to drop the column `hash` on the `source_texts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[page_id,text_and_occurrence_hash]` on the table `source_texts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "source_texts_page_id_hash_key";

-- AlterTable
ALTER TABLE "source_texts" DROP COLUMN "hash",
ADD COLUMN     "text_and_occurrence_hash" TEXT;

-- CreateIndex
CREATE INDEX "source_texts_text_and_occurrence_hash_idx" ON "source_texts"("text_and_occurrence_hash");

-- CreateIndex
CREATE UNIQUE INDEX "source_texts_page_id_text_and_occurrence_hash_key" ON "source_texts"("page_id", "text_and_occurrence_hash");

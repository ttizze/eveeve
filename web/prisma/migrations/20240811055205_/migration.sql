/*
  Warnings:

  - A unique constraint covering the columns `[page_id,number]` on the table `source_texts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "source_texts_number_page_id_idx";

-- DropIndex
DROP INDEX "source_texts_number_page_id_key";

-- CreateIndex
CREATE INDEX "source_texts_page_id_number_idx" ON "source_texts"("page_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "source_texts_page_id_number_key" ON "source_texts"("page_id", "number");

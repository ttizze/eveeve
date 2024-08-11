/*
  Warnings:

  - A unique constraint covering the columns `[number,page_id]` on the table `source_texts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `number` to the `source_texts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "source_texts_page_id_idx";

-- AlterTable
ALTER TABLE "source_texts" ADD COLUMN     "number" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "source_texts_number_page_id_idx" ON "source_texts"("number", "page_id");

-- CreateIndex
CREATE UNIQUE INDEX "source_texts_number_page_id_key" ON "source_texts"("number", "page_id");

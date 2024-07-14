/*
  Warnings:

  - A unique constraint covering the columns `[text_hash,page_version_id,number]` on the table `source_texts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `number` to the `source_texts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "source_texts_text_hash_page_id_key";

-- AlterTable
ALTER TABLE "source_texts" ADD COLUMN     "number" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "source_texts_text_hash_page_version_id_number_key" ON "source_texts"("text_hash", "page_version_id", "number");

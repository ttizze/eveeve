/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `source_texts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "source_texts" ADD COLUMN     "hash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "source_texts_hash_key" ON "source_texts"("hash");

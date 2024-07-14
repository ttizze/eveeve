/*
  Warnings:

  - Added the required column `number` to the `source_texts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "source_texts" ADD COLUMN     "html_tag" TEXT,
ADD COLUMN     "number" INTEGER NOT NULL;

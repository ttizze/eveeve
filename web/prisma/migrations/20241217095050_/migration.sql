/*
  Warnings:

  - Made the column `text_and_occurrence_hash` on table `source_texts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "source_texts" ALTER COLUMN "text_and_occurrence_hash" SET NOT NULL;

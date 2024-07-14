/*
  Warnings:

  - You are about to drop the column `html_tag` on the `source_texts` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `source_texts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "source_texts" DROP COLUMN "html_tag",
DROP COLUMN "number";

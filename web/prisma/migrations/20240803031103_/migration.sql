/*
  Warnings:

  - You are about to drop the column `page_id` on the `source_texts` table. All the data in the column will be lost.
  - You are about to drop the column `page_version_id` on the `source_texts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "source_texts" DROP CONSTRAINT "source_texts_page_id_fkey";

-- DropForeignKey
ALTER TABLE "source_texts" DROP CONSTRAINT "source_texts_page_version_id_fkey";

-- AlterTable
ALTER TABLE "source_texts" DROP COLUMN "page_id",
DROP COLUMN "page_version_id";

/*
  Warnings:

  - You are about to drop the column `page_id` on the `translate_texts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "translate_texts" DROP CONSTRAINT "translate_texts_page_id_fkey";

-- AlterTable
ALTER TABLE "translate_texts" DROP COLUMN "page_id";

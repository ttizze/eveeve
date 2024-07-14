/*
  Warnings:

  - You are about to drop the column `web_page_version_id` on the `source_texts` table. All the data in the column will be lost.
  - Added the required column `page_version_id` to the `source_texts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "source_texts" DROP COLUMN "web_page_version_id",
ADD COLUMN     "page_version_id" INTEGER NOT NULL;

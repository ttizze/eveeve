/*
  Warnings:

  - You are about to drop the column `page_id` on the `page_versions` table. All the data in the column will be lost.
  - You are about to drop the `pages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "page_versions" DROP CONSTRAINT "page_versions_page_id_fkey";

-- AlterTable
ALTER TABLE "page_versions" DROP COLUMN "page_id";

-- DropTable
DROP TABLE "pages";

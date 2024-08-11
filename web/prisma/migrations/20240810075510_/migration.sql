/*
  Warnings:

  - You are about to drop the column `content_hash` on the `pages` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "pages_content_hash_key";

-- AlterTable
ALTER TABLE "pages" DROP COLUMN "content_hash";

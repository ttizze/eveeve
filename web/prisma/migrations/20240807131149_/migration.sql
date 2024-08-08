/*
  Warnings:

  - You are about to drop the column `sourceUrl` on the `pages` table. All the data in the column will be lost.

*/
-- AlterTable
-- Rename column "sourceUrl" to "source_url"
ALTER TABLE "pages" RENAME COLUMN "sourceUrl" TO "source_url";
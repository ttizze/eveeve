/*
  Warnings:

  - You are about to drop the column `archived` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `is_public` on the `pages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pages" DROP COLUMN "archived",
DROP COLUMN "is_public",
ADD COLUMN     "is_archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false;

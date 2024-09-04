/*
  Warnings:

  - Added the required column `updated_at` to the `pages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "pages" SET "updated_at" = "created_at";
ALTER TABLE "pages" ALTER COLUMN "updated_at" DROP DEFAULT;
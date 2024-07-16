/*
  Warnings:

  - You are about to drop the column `status` on the `translation_status` table. All the data in the column will be lost.
  - Added the required column `title` to the `translation_status` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "translation_status" DROP COLUMN "status",
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "translation_status" TEXT NOT NULL DEFAULT 'pending';

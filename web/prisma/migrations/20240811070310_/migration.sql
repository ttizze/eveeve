/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_slug_key" ON "users"("slug");

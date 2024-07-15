/*
  Warnings:

  - You are about to drop the column `vote_value` on the `votes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[translate_text_id,user_id]` on the table `votes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `is_upvote` to the `votes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "votes" DROP COLUMN "vote_value",
ADD COLUMN     "is_upvote" BOOLEAN NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "votes_translate_text_id_user_id_key" ON "votes"("translate_text_id", "user_id");

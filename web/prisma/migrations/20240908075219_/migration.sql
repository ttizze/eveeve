/*
  Warnings:

  - You are about to drop the `page_likes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "page_likes" DROP CONSTRAINT "page_likes_page_id_fkey";

-- DropForeignKey
ALTER TABLE "page_likes" DROP CONSTRAINT "page_likes_user_id_fkey";

-- DropTable
DROP TABLE "page_likes";

-- CreateTable
CREATE TABLE "like_pages" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "page_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "like_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "like_pages_user_id_page_id_key" ON "like_pages"("user_id", "page_id");

-- AddForeignKey
ALTER TABLE "like_pages" ADD CONSTRAINT "like_pages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "like_pages" ADD CONSTRAINT "like_pages_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

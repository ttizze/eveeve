/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `pages` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[content_hash]` on the table `pages` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "pages_url_content_hash_key";

-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "original_language" TEXT NOT NULL DEFAULT 'unknown';

-- CreateTable
CREATE TABLE "authors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "author_pages" (
    "authorId" INTEGER NOT NULL,
    "pageId" INTEGER NOT NULL,

    CONSTRAINT "author_pages_pkey" PRIMARY KEY ("authorId","pageId")
);

-- CreateTable
CREATE TABLE "genres" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genre_pages" (
    "genreId" INTEGER NOT NULL,
    "pageId" INTEGER NOT NULL,

    CONSTRAINT "genre_pages_pkey" PRIMARY KEY ("genreId","pageId")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_pages" (
    "tagId" INTEGER NOT NULL,
    "pageId" INTEGER NOT NULL,

    CONSTRAINT "tag_pages_pkey" PRIMARY KEY ("tagId","pageId")
);

-- CreateIndex
CREATE UNIQUE INDEX "genres_name_key" ON "genres"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pages_url_key" ON "pages"("url");

-- CreateIndex
CREATE UNIQUE INDEX "pages_content_hash_key" ON "pages"("content_hash");

-- AddForeignKey
ALTER TABLE "author_pages" ADD CONSTRAINT "author_pages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "author_pages" ADD CONSTRAINT "author_pages_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "genre_pages" ADD CONSTRAINT "genre_pages_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "genres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "genre_pages" ADD CONSTRAINT "genre_pages_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_pages" ADD CONSTRAINT "tag_pages_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_pages" ADD CONSTRAINT "tag_pages_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

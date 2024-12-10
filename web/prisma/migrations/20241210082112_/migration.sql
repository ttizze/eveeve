-- DropForeignKey
ALTER TABLE "tag_pages" DROP CONSTRAINT "tag_pages_pageId_fkey";

-- DropForeignKey
ALTER TABLE "tag_pages" DROP CONSTRAINT "tag_pages_tagId_fkey";

-- AddForeignKey
ALTER TABLE "tag_pages" ADD CONSTRAINT "tag_pages_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_pages" ADD CONSTRAINT "tag_pages_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

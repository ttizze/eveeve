-- DropForeignKey
ALTER TABLE "like_pages" DROP CONSTRAINT "like_pages_page_id_fkey";

-- DropForeignKey
ALTER TABLE "like_pages" DROP CONSTRAINT "like_pages_user_id_fkey";

-- DropForeignKey
ALTER TABLE "page_translation_info" DROP CONSTRAINT "page_translation_info_page_id_fkey";

-- DropForeignKey
ALTER TABLE "pages" DROP CONSTRAINT "pages_user_id_fkey";

-- DropForeignKey
ALTER TABLE "source_texts" DROP CONSTRAINT "source_texts_page_id_fkey";

-- DropForeignKey
ALTER TABLE "translate_texts" DROP CONSTRAINT "translate_texts_source_text_id_fkey";

-- DropForeignKey
ALTER TABLE "translate_texts" DROP CONSTRAINT "translate_texts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_ai_translation_info" DROP CONSTRAINT "user_ai_translation_info_page_id_fkey";

-- DropForeignKey
ALTER TABLE "user_ai_translation_info" DROP CONSTRAINT "user_ai_translation_info_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_read_history" DROP CONSTRAINT "user_read_history_page_id_fkey";

-- DropForeignKey
ALTER TABLE "user_read_history" DROP CONSTRAINT "user_read_history_user_id_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_translate_text_id_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_user_id_fkey";

-- AddForeignKey
ALTER TABLE "user_ai_translation_info" ADD CONSTRAINT "user_ai_translation_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_ai_translation_info" ADD CONSTRAINT "user_ai_translation_info_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_read_history" ADD CONSTRAINT "user_read_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_read_history" ADD CONSTRAINT "user_read_history_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_translation_info" ADD CONSTRAINT "page_translation_info_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "like_pages" ADD CONSTRAINT "like_pages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "like_pages" ADD CONSTRAINT "like_pages_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_texts" ADD CONSTRAINT "source_texts_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translate_texts" ADD CONSTRAINT "translate_texts_source_text_id_fkey" FOREIGN KEY ("source_text_id") REFERENCES "source_texts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translate_texts" ADD CONSTRAINT "translate_texts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_translate_text_id_fkey" FOREIGN KEY ("translate_text_id") REFERENCES "translate_texts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropIndex
DROP INDEX "source_texts_page_id_number_text_key";

-- CreateIndex
CREATE INDEX "source_texts_page_id_number_idx" ON "source_texts"("page_id", "number");

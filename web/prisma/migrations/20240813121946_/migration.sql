/*
  Warnings:

  - A unique constraint covering the columns `[page_id,number,text]` on the table `source_texts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "source_texts_page_id_number_text_key" ON "source_texts"("page_id", "number", "text");

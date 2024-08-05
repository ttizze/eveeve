/*
  Warnings:

  - You are about to drop the `page_version_source_texts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `page_version_translation_info` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "page_version_source_texts" DROP CONSTRAINT "page_version_source_texts_page_id_fkey";

-- DropForeignKey
ALTER TABLE "page_version_source_texts" DROP CONSTRAINT "page_version_source_texts_source_text_id_fkey";

-- DropForeignKey
ALTER TABLE "page_version_translation_info" DROP CONSTRAINT "page_version_translation_info_page_id_fkey";


-- CreateTable
CREATE TABLE "page_translation_info" (
    "id" SERIAL NOT NULL,
    "page_id" INTEGER NOT NULL,
    "target_language" TEXT NOT NULL,
    "translation_title" TEXT NOT NULL,

    CONSTRAINT "page_translation_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_source_texts" (
    "id" SERIAL NOT NULL,
    "page_id" INTEGER NOT NULL,
    "source_text_id" INTEGER NOT NULL,

    CONSTRAINT "page_source_texts_pkey" PRIMARY KEY ("id")
);

INSERT INTO page_translation_info (page_id, target_language, translation_title)
SELECT page_id, target_language, translation_title FROM page_version_translation_info;

INSERT INTO page_source_texts (page_id, source_text_id)
SELECT page_id, source_text_id FROM page_version_source_texts;

-- DropTable
DROP TABLE "page_version_source_texts";

-- DropTable
DROP TABLE "page_version_translation_info";

-- CreateIndex
CREATE UNIQUE INDEX "page_translation_info_page_id_target_language_key" ON "page_translation_info"("page_id", "target_language");

-- CreateIndex
CREATE INDEX "page_source_texts_page_id_idx" ON "page_source_texts"("page_id");

-- CreateIndex
CREATE UNIQUE INDEX "page_source_texts_page_id_source_text_id_key" ON "page_source_texts"("page_id", "source_text_id");

-- AddForeignKey
ALTER TABLE "page_translation_info" ADD CONSTRAINT "page_translation_info_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_source_texts" ADD CONSTRAINT "page_source_texts_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_source_texts" ADD CONSTRAINT "page_source_texts_source_text_id_fkey" FOREIGN KEY ("source_text_id") REFERENCES "source_texts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "page_version_source_texts" (
    "id" SERIAL NOT NULL,
    "page_version_id" INTEGER NOT NULL,
    "source_text_id" INTEGER NOT NULL,

    CONSTRAINT "page_version_source_texts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_version_source_texts_page_version_id_idx" ON "page_version_source_texts"("page_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "page_version_source_texts_page_version_id_source_text_id_key" ON "page_version_source_texts"("page_version_id", "source_text_id");

-- AddForeignKey
ALTER TABLE "page_version_source_texts" ADD CONSTRAINT "page_version_source_texts_page_version_id_fkey" FOREIGN KEY ("page_version_id") REFERENCES "page_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_version_source_texts" ADD CONSTRAINT "page_version_source_texts_source_text_id_fkey" FOREIGN KEY ("source_text_id") REFERENCES "source_texts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

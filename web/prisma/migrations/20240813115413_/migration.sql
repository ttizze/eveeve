-- DropIndex
DROP INDEX "source_texts_page_id_number_idx";

-- DropIndex
DROP INDEX "source_texts_page_id_number_key";

-- AlterTable
ALTER TABLE "source_texts" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "source_texts_page_id_idx" ON "source_texts"("page_id");

/*
  Warnings:

  - A unique constraint covering the columns `[page_id,number]` on the table `source_texts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "source_texts_page_id_number_idx";
DELETE FROM source_texts
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
              ROW_NUMBER() OVER (PARTITION BY page_id, number ORDER BY created_at DESC) as rn
        FROM source_texts
    ) t
    WHERE t.rn > 1
);

-- CreateIndex
CREATE UNIQUE INDEX "source_texts_page_id_number_key" ON "source_texts"("page_id", "number");

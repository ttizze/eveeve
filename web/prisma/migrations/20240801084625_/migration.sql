/*
  Warnings:

  - You are about to drop the column `page_version_id` on the `source_texts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[text_hash,number]` on the table `source_texts` will be added. If there are existing duplicate values, this will fail.

*/


CREATE TEMPORARY TABLE source_text_mapping AS
SELECT s1.id AS old_id, MIN(s2.id) AS new_id
FROM source_texts s1
JOIN source_texts s2 ON s1.text_hash = s2.text_hash AND s1.number = s2.number
WHERE s1.id > s2.id
GROUP BY s1.id;

-- translate_texts の source_text_id を更新
UPDATE translate_texts
SET source_text_id = m.new_id
FROM source_text_mapping m
WHERE translate_texts.source_text_id = m.old_id;
DELETE FROM source_texts
WHERE id IN (SELECT old_id FROM source_text_mapping);

-- 一時テーブルを削除
DROP TABLE source_text_mapping;
-- DropForeignKey
ALTER TABLE "source_texts" DROP CONSTRAINT "source_texts_page_version_id_fkey";

-- DropIndex
DROP INDEX "source_texts_text_hash_page_version_id_number_key";

-- AlterTable
ALTER TABLE "source_texts" DROP COLUMN "page_version_id";

-- CreateIndex
CREATE UNIQUE INDEX "source_texts_text_hash_number_key" ON "source_texts"("text_hash", "number");

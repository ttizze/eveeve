/*
  Warnings:

  - You are about to drop the `translation_status` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "translation_status" DROP CONSTRAINT "translation_status_page_version_id_fkey";

-- DropTable
DROP TABLE "translation_status";

-- CreateTable
CREATE TABLE "page_version_translation_info" (
    "id" SERIAL NOT NULL,
    "page_version_id" INTEGER NOT NULL,
    "target_language" TEXT NOT NULL,
    "translation_title" TEXT NOT NULL,
    "translation_status" TEXT NOT NULL DEFAULT 'pending',
    "translation_progress" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "page_version_translation_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_version_translation_info_page_version_id_target_langua_key" ON "page_version_translation_info"("page_version_id", "target_language");

-- AddForeignKey
ALTER TABLE "page_version_translation_info" ADD CONSTRAINT "page_version_translation_info_page_version_id_fkey" FOREIGN KEY ("page_version_id") REFERENCES "page_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "user_read_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "page_version_id" INTEGER NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_data_number" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_read_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_read_history_user_id_idx" ON "user_read_history"("user_id");

-- CreateIndex
CREATE INDEX "user_read_history_page_version_id_idx" ON "user_read_history"("page_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_read_history_user_id_page_version_id_key" ON "user_read_history"("user_id", "page_version_id");

-- AddForeignKey
ALTER TABLE "user_read_history" ADD CONSTRAINT "user_read_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_read_history" ADD CONSTRAINT "user_read_history_page_version_id_fkey" FOREIGN KEY ("page_version_id") REFERENCES "page_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

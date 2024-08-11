-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "total_points" INTEGER NOT NULL DEFAULT 0,
    "is_ai" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT NOT NULL DEFAULT 'Credentials',
    "gemini_api_key" TEXT,
    "openai_api_key" TEXT,
    "claude_api_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_ai_translation_info" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL DEFAULT 'unknown',
    "target_language" TEXT NOT NULL,
    "ai_translation_status" TEXT NOT NULL DEFAULT 'pending',
    "ai_translation_progress" INTEGER NOT NULL DEFAULT 0,
    "last_translated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_ai_translation_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_read_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "page_id" INTEGER NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_data_number" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_read_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_translation_info" (
    "id" SERIAL NOT NULL,
    "page_id" INTEGER NOT NULL,
    "target_language" TEXT NOT NULL,
    "translation_title" TEXT NOT NULL,

    CONSTRAINT "page_translation_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "content_hash" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genres" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genre_pages" (
    "genreId" INTEGER NOT NULL,
    "pageId" INTEGER NOT NULL,

    CONSTRAINT "genre_pages_pkey" PRIMARY KEY ("genreId","pageId")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_pages" (
    "tagId" INTEGER NOT NULL,
    "pageId" INTEGER NOT NULL,

    CONSTRAINT "tag_pages_pkey" PRIMARY KEY ("tagId","pageId")
);

-- CreateTable
CREATE TABLE "source_texts" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "text_hash" BYTEA NOT NULL,
    "page_id" INTEGER NOT NULL,

    CONSTRAINT "source_texts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translate_texts" (
    "id" SERIAL NOT NULL,
    "targetLanguage" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "source_text_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "point" INTEGER NOT NULL DEFAULT 0,
    "edit_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "translate_texts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "translate_text_id" INTEGER NOT NULL,
    "is_upvote" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_usage" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date_time" TIMESTAMP(3) NOT NULL,
    "amount_used" INTEGER NOT NULL,

    CONSTRAINT "api_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomAIModel" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomAIModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "user_ai_translation_info_user_id_idx" ON "user_ai_translation_info"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_ai_translation_info_user_id_slug_target_language_key" ON "user_ai_translation_info"("user_id", "slug", "target_language");

-- CreateIndex
CREATE INDEX "user_read_history_user_id_idx" ON "user_read_history"("user_id");

-- CreateIndex
CREATE INDEX "user_read_history_page_id_idx" ON "user_read_history"("page_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_read_history_user_id_page_id_key" ON "user_read_history"("user_id", "page_id");

-- CreateIndex
CREATE UNIQUE INDEX "page_translation_info_page_id_target_language_key" ON "page_translation_info"("page_id", "target_language");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pages_content_hash_key" ON "pages"("content_hash");

-- CreateIndex
CREATE UNIQUE INDEX "genres_name_key" ON "genres"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "source_texts_text_hash_number_page_id_idx" ON "source_texts"("text_hash", "number", "page_id");

-- CreateIndex
CREATE UNIQUE INDEX "source_texts_text_hash_number_page_id_key" ON "source_texts"("text_hash", "number", "page_id");

-- CreateIndex
CREATE UNIQUE INDEX "votes_translate_text_id_user_id_key" ON "votes"("translate_text_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "CustomAIModel_userId_name_key" ON "CustomAIModel"("userId", "name");

-- AddForeignKey
ALTER TABLE "user_ai_translation_info" ADD CONSTRAINT "user_ai_translation_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_read_history" ADD CONSTRAINT "user_read_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_read_history" ADD CONSTRAINT "user_read_history_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_translation_info" ADD CONSTRAINT "page_translation_info_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "genre_pages" ADD CONSTRAINT "genre_pages_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "genres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "genre_pages" ADD CONSTRAINT "genre_pages_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_pages" ADD CONSTRAINT "tag_pages_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_pages" ADD CONSTRAINT "tag_pages_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_texts" ADD CONSTRAINT "source_texts_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translate_texts" ADD CONSTRAINT "translate_texts_source_text_id_fkey" FOREIGN KEY ("source_text_id") REFERENCES "source_texts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translate_texts" ADD CONSTRAINT "translate_texts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_translate_text_id_fkey" FOREIGN KEY ("translate_text_id") REFERENCES "translate_texts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_usage" ADD CONSTRAINT "api_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomAIModel" ADD CONSTRAINT "CustomAIModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

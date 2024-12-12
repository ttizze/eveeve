-- CreateIndex
CREATE INDEX "CustomAIModel_name_idx" ON "CustomAIModel"("name");

-- CreateIndex
CREATE INDEX "api_usage_date_time_idx" ON "api_usage"("date_time");

-- CreateIndex
CREATE INDEX "genre_pages_genreId_idx" ON "genre_pages"("genreId");

-- CreateIndex
CREATE INDEX "genre_pages_pageId_idx" ON "genre_pages"("pageId");

-- CreateIndex
CREATE INDEX "genres_name_idx" ON "genres"("name");

-- CreateIndex
CREATE INDEX "like_pages_user_id_idx" ON "like_pages"("user_id");

-- CreateIndex
CREATE INDEX "like_pages_page_id_idx" ON "like_pages"("page_id");

-- CreateIndex
CREATE INDEX "page_translation_info_page_id_idx" ON "page_translation_info"("page_id");

-- CreateIndex
CREATE INDEX "page_translation_info_target_language_idx" ON "page_translation_info"("target_language");

-- CreateIndex
CREATE INDEX "pages_slug_idx" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "source_texts_number_idx" ON "source_texts"("number");

-- CreateIndex
CREATE INDEX "tag_pages_tagId_idx" ON "tag_pages"("tagId");

-- CreateIndex
CREATE INDEX "tag_pages_pageId_idx" ON "tag_pages"("pageId");

-- CreateIndex
CREATE INDEX "tags_name_idx" ON "tags"("name");

-- CreateIndex
CREATE INDEX "translate_texts_targetLanguage_idx" ON "translate_texts"("targetLanguage");

-- CreateIndex
CREATE INDEX "user_ai_translation_info_page_id_idx" ON "user_ai_translation_info"("page_id");

-- CreateIndex
CREATE INDEX "user_read_history_user_id_idx" ON "user_read_history"("user_id");

-- CreateIndex
CREATE INDEX "user_read_history_page_id_idx" ON "user_read_history"("page_id");

-- CreateIndex
CREATE INDEX "users_user_name_idx" ON "users"("user_name");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "votes_translate_text_id_idx" ON "votes"("translate_text_id");

-- CreateIndex
CREATE INDEX "votes_user_id_idx" ON "votes"("user_id");

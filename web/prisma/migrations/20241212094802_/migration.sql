-- CreateIndex
CREATE INDEX "CustomAIModel_userId_idx" ON "CustomAIModel"("userId");

-- CreateIndex
CREATE INDEX "api_usage_user_id_idx" ON "api_usage"("user_id");

-- CreateIndex
CREATE INDEX "pages_user_id_idx" ON "pages"("user_id");

-- CreateIndex
CREATE INDEX "source_texts_page_id_idx" ON "source_texts"("page_id");

-- CreateIndex
CREATE INDEX "translate_texts_source_text_id_idx" ON "translate_texts"("source_text_id");

-- CreateIndex
CREATE INDEX "translate_texts_user_id_idx" ON "translate_texts"("user_id");

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "claude_api_key" TEXT,
ADD COLUMN     "openai_api_key" TEXT;

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
CREATE UNIQUE INDEX "CustomAIModel_userId_name_key" ON "CustomAIModel"("userId", "name");

-- AddForeignKey
ALTER TABLE "CustomAIModel" ADD CONSTRAINT "CustomAIModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

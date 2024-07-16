import { prisma } from "~/utils/prisma"

export async function updatePageVersionTranslationInfoTranslationStatusAndTranslationProgress(
  pageVersionId: number,
  targetLanguage: string,
  translationStatus: string,
  translationProgress: number,
) {
  await prisma.pageVersionTranslationInfo.update({
    where: {
      pageVersionId_targetLanguage: {
        pageVersionId,
        targetLanguage,
      },
    },
    data: {
      translationStatus,
      translationProgress,
    },
  });
  return {
    pageVersionId,
    translationStatus,
    translationProgress,
  };
}

export async function updatePageVersionTranslationInfoTitle(pageVersionId: number, targetLanguage: string, translationTitle: string) {
  await prisma.pageVersionTranslationInfo.update({
    where: {
      pageVersionId_targetLanguage: {
        pageVersionId,
        targetLanguage,
      },
    },
    data: {
      translationTitle,
    },
  });
}

export async function getOrCreatePageVersionTranslationInfo(pageVersionId: number, targetLanguage: string, translationTitle?: string) {
  return await prisma.pageVersionTranslationInfo.upsert({
    where: {
      pageVersionId_targetLanguage: {
        pageVersionId,
        targetLanguage,
      },
    },
      update: {},
      create: {
        pageVersionId,
        targetLanguage,
        translationTitle: translationTitle ?? '',
        translationStatus: "in_progress",
        translationProgress: 0,
      },
  });
}

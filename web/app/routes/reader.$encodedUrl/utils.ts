import { prisma } from "../../utils/prisma";
import type { PageVersion, SourceTextTranslations } from "./types";

export async function fetchLatestPageVersionWithTranslations(url: string) {
  return prisma.pageVersion.findFirst({
    where: { url },
    orderBy: { createdAt: "desc" },
    include: {
      sourceTexts: {
        include: {
          translateTexts: {
            where: { language: "ja" },
            include: {
              votes: true,
              user: { select: { name: true } }
            },
            orderBy: [
              { point: "desc" },
              { createdAt: "desc" }
            ],
          },
        },
      },
    },
  });
}
export function mapSourceTextsToTranslations(sourceTexts:  PageVersion['sourceTexts'], userId: number | undefined): SourceTextTranslations[] {
  return sourceTexts.map((sourceText) => ({
    number: sourceText.number,
    translations: sourceText.translateTexts.map((translateText) => {
      const userVote = translateText.votes.find((vote) => vote.userId === userId);
      return {
        id: translateText.id,
        text: translateText.text,
        point: translateText.point,
        userName: translateText.user.name,
        userVoteStatus: userVote 
          ? (userVote.isUpvote ? 'upvoted' : 'downvoted')
          : 'not_voted',
      };
    }),
  }));
}
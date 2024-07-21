import { prisma } from "../../utils/prisma";
import type {
	LatestPageVersionWithTranslations,
	SourceTextTranslations,
} from "./types";

import { JSDOM } from "jsdom";
const { Node } = new JSDOM().window;

interface ContentSection {
	html: string;
	dataNumber: number[];
}

export function splitContentByHeadings(content: string): ContentSection[] {
	const dom = new JSDOM(content);
	const document = dom.window.document;
	const sections: ContentSection[] = [];
	let currentSection = document.createElement("div");
	let currentDataNumber: number[] = [];
  let nonHeadingElementCount = 0;

	const processNode = (node: Node) => {
		if (node.nodeType === Node.ELEMENT_NODE) {
			const element = node as HTMLElement;
      const isHeading = element.tagName.match(/^H[1-3]$/);

      if (isHeading && nonHeadingElementCount >= 5) {
        if (currentSection.childNodes.length > 0) {
          sections.push({
            html: currentSection.innerHTML,
            dataNumber: currentDataNumber,
          });
        }
        currentSection = document.createElement("div");
        currentDataNumber = [];
        nonHeadingElementCount = 0;
      }

      if (!isHeading && element.textContent?.trim()) {
        nonHeadingElementCount++;
      }

      currentSection.appendChild(element.cloneNode(true));
      const dataNumber = element.getAttribute("data-number");
      if (dataNumber) {
        currentDataNumber.push(Number.parseInt(dataNumber, 10));
      }

      Array.from(element.childNodes).forEach(processNode);
    }
  };

  Array.from(document.body.children).forEach(processNode);

	if (currentSection.childNodes.length > 0) {
		sections.push({
			html: currentSection.innerHTML,
			dataNumber: currentDataNumber,
		});
	}

	console.log("sections", sections.length);
	return sections;
}

export async function fetchLatestPageVersionWithTranslations(
  url: string,
  userId: number | null,
  targetLanguage: string,
  numbers: number[]
): Promise<LatestPageVersionWithTranslations | null> {
  const pageVersion = await prisma.pageVersion.findFirst({
    where: { url },
    orderBy: { createdAt: "desc" },
    select: {
      title: true,
      url: true,
      content: true,
      sourceTexts: {
        where: {
          number: { in: numbers }
        },
        select: {
          id: true,
          number: true,
          translateTexts: {
            where: { targetLanguage },
            select: {
              id: true,
              text: true,
              point: true,
              user: { select: { name: true } },
              votes: {
                where: userId ? { userId } : undefined,
                select: {
                  id: true,
                  isUpvote: true,
                  updatedAt: true,
                },
                orderBy: { updatedAt: "desc" },
                take: 1,
              },
            },
            orderBy: [{ point: "desc" }, { createdAt: "desc" }],
          },
        },
      },
    },
  });
	if (!pageVersion) return null;

	const translations: SourceTextTranslations[] = pageVersion.sourceTexts.map(
		(sourceText) => ({
			number: sourceText.number,
			sourceTextId: sourceText.id,
			translations: sourceText.translateTexts.map((translateText) => ({
				id: translateText.id,
				text: translateText.text,
				point: translateText.point,
				userName: translateText.user.name,
				userVote: translateText.votes[0] || null,
			})),
		}),
	);

	return {
		title: pageVersion.title,
		url: pageVersion.url,
		content: pageVersion.content,
		translations,
		userId,
	};
}

import { Parser } from "htmlparser2";
import { prisma } from "../../utils/prisma";
import type {
	LatestPageVersionWithTranslations,
	SourceTextTranslations,
} from "./types";

interface ContentSection {
	html: string;
	dataNumber: number[];
}

export function splitContentByHeadings(content: string): ContentSection[] {
	const sections: ContentSection[] = [];
	let currentSection: string[] = [];
	let currentDataNumber: number[] = [];
	let nonHeadingElementCount = 0;

	const parser = new Parser(
		{
			onopentag(name, attributes) {
				const isHeading = name.match(/^h[1-3]$/i);
				if (isHeading && nonHeadingElementCount >= 5) {
					if (currentSection.length > 0) {
						console.log(`Pushing section:
            Length: ${currentSection.length}
            DataNumber: ${currentDataNumber}
            First element: ${currentSection[0]}
            Last element: ${currentSection[currentSection.length - 1]}
          `);
						sections.push({
							html: currentSection.join(""),
							dataNumber: currentDataNumber,
						});
						currentSection = [];
						currentDataNumber = [];
						nonHeadingElementCount = 0;
					}
				}
				const dataNumber = attributes["data-number"];
				if (!isHeading && dataNumber) {
					nonHeadingElementCount++;
				}
				if (dataNumber) {
					currentDataNumber.push(Number.parseInt(dataNumber, 10));
				}
				currentSection.push(
					`<${name}${Object.entries(attributes)
						.map(([key, value]) => ` ${key}="${value}"`)
						.join("")}>`,
				);
			},
			ontext(text) {
				currentSection.push(text);
			},
			onclosetag(name) {
				currentSection.push(`</${name}>`);
			},
		},
		{ decodeEntities: true },
	);

	parser.write(content);
	parser.end();

	if (currentSection.length > 0) {
		sections.push({
			html: currentSection.join(""),
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
	numbers: number[],
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
					number: { in: numbers },
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

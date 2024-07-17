import { createHash } from "node:crypto";
import { prisma } from "../utils/prisma";

export async function getOrCreateSourceTextId(
	text: string,
	number: number,
	pageId: number,
	pageVersionId: number,
): Promise<number> {
	const textHash = Buffer.from(
		createHash("sha256").update(text).digest("hex"),
		"hex",
	);

	try {
		const sourceText = await prisma.sourceText.upsert({
			where: {
				textHash_pageVersionId_number: {
					textHash,
					pageVersionId,
					number,
				},
			},
			update: {},
			create: {
				text,
				number,
				textHash,
				pageId,
				pageVersionId,
			},
		});

		return sourceText.id;
	} catch (error) {
		console.error("Error getting or creating source text:", error);
		throw new Error("Error getting or creating source text");
	}
}

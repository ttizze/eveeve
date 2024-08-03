import { createHash } from "node:crypto";
import { prisma } from "~/utils/prisma";

export async function getOrCreateSourceTextIdAndPageVersionSourceText(
	text: string,
	number: number,
	pageVersionId: number,
): Promise<number> {
	const textHash = Buffer.from(
		createHash("sha256").update(text).digest("hex"),
		"hex",
	);

	const result = await prisma.$transaction(async (tx) => {
		const sourceText = await tx.sourceText.upsert({
			where: {
				textHash_number: {
					textHash,
					number,
				},
			},
			update: {},
			create: {
				text,
				number,
				textHash,
			},
		});

		await tx.pageVersionSourceText.upsert({
			where: {
				pageVersionId_sourceTextId: {
					pageVersionId,
					sourceTextId: sourceText.id,
				},
			},
			update: {},
			create: {
				pageVersionId,
				sourceTextId: sourceText.id,
			},
		});

		return sourceText.id;
	});
	console.log(result);
	return result;
}

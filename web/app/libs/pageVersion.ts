import { createHash } from "node:crypto";
import { prisma } from "../utils/prisma";

export async function getOrCreatePageVersionId(
	url: string,
	title: string,
	content: string,
	pageId: number,
): Promise<number> {
	const contentHash = Buffer.from(
		createHash("sha256").update(content).digest("hex"),
		"hex",
	);

	const existingVersion = await prisma.pageVersion.findFirst({
		where: {
			url,
			contentHash,
		},
	});

	if (existingVersion) {
		return existingVersion.id;
	}

	const newVersion = await prisma.pageVersion.create({
		data: {
			title,
			url,
			content,
			contentHash,
			page: {
				connect: {
					id: pageId,
				},
			},
		},
	});

	console.log(`New PageVersion created: ${newVersion.title}`);
	return newVersion.id;
}

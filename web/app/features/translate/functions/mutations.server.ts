import { createHash } from "node:crypto";
import { prisma } from "~/utils/prisma";

export async function getOrCreateSourceTextIdAndPageVersionSourceText(
	text: string,
	number: number,
	pageVersionId: number,
): Promise<{ id: number; number: number }> {
	const textHash = Buffer.from(
		createHash("sha256").update(text).digest("hex"),
		"hex",
	);

	return prisma.$transaction(async (tx) => {
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

		return { id: sourceText.id, number: sourceText.number };
	});
}

export async function getOrCreateAIUser(name: string): Promise<number> {
	const user = await prisma.user.upsert({
		where: { email: `${name}@ai.com` },
		update: {},
		create: { name, email: `${name}@ai.com`, isAI: true, image: "" },
	});

	return user.id;
}

export async function getOrCreatePageVersionTranslationInfo(
	pageVersionId: number,
	targetLanguage: string,
	translationTitle: string,
) {
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
			translationTitle,
		},
	});
}

export async function getOrCreatePageId(url: string): Promise<number> {
	const page = await prisma.page.upsert({
		where: { url },
		update: {},
		create: { url },
	});
	return page.id;
}

export async function getOrCreatePageVersionId(
	url: string,
	title: string,
	content: string,
	pageId: number,
): Promise<number> {
	const normalizedContent = content.trim().replace(/\s+/g, " ");
	const contentHash = Buffer.from(
		createHash("sha256").update(normalizedContent).digest("hex"),
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

export async function updateUserAITranslationInfo(
	userId: number,
	pageVersionId: number,
	targetLanguage: string,
	status: string,
	progress: number,
) {
	return await prisma.userAITranslationInfo.update({
		where: {
			userId_pageVersionId_targetLanguage: {
				userId,
				pageVersionId,
				targetLanguage,
			},
		},
		data: {
			aiTranslationStatus: status,
			aiTranslationProgress: progress,
			lastTranslatedAt: new Date(),
		},
	});
}

export async function getOrCreateUserAITranslationInfo(
	userId: number,
	pageVersionId: number,
	targetLanguage: string,
) {
	try {
		const userAITranslationInfo = await prisma.userAITranslationInfo.upsert({
			where: {
				userId_pageVersionId_targetLanguage: {
					userId,
					pageVersionId,
					targetLanguage,
				},
			},
			update: {
				aiTranslationStatus: "pending",
				aiTranslationProgress: 0,
			},
			create: {
				userId,
				pageVersionId,
				targetLanguage,
				aiTranslationStatus: "pending",
				aiTranslationProgress: 0,
			},
		});
		return userAITranslationInfo;
	} catch (error) {
		console.error("Error in getOrCreateUserAITranslationInfo:", error);
		throw error;
	}
}

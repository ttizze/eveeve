import { createHash } from "node:crypto";
import { prisma } from "~/utils/prisma";

export async function getOrCreateSourceTextIdAndPageSourceText(
	text: string,
	number: number,
	pageId: number,
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

		await tx.pageSourceText.upsert({
			where: {
				pageId_sourceTextId: {
					pageId,
					sourceTextId: sourceText.id,
				},
			},
			update: {},
			create: {
				pageId,
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

export async function getOrCreatePageTranslationInfo(
	pageId: number,
	targetLanguage: string,
	translationTitle: string,
) {
	return await prisma.pageTranslationInfo.upsert({
		where: {
			pageId_targetLanguage: {
				pageId,
				targetLanguage,
			},
		},
		update: {},
		create: {
			pageId,
			targetLanguage,
			translationTitle,
		},
	});
}

export async function getOrCreatePageId(
	url: string,
	title: string,
	content: string,
): Promise<number> {
	const normalizedContent = content.trim().replace(/\s+/g, " ");
	const contentHash = Buffer.from(
		createHash("sha256").update(normalizedContent).digest("hex"),
		"hex",
	);
	const existingPage = await prisma.page.findFirst({
		where: {
			url,
			contentHash,
		},
	});

	if (existingPage) {
		return existingPage.id;
	}

	const newPage = await prisma.page.create({
		data: {
			title,
			url,
			content,
			contentHash,
		},
	});

	console.log(`New Page created: ${newPage.title}`);
	return newPage.id;
}

export async function updateUserAITranslationInfo(
	userId: number,
	url: string,
	targetLanguage: string,
	status: string,
	progress: number,
) {
	return await prisma.userAITranslationInfo.update({
		where: {
			userId_url_targetLanguage: {
				userId,
				url,
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

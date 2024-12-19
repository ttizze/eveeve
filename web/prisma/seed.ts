import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface SeedText {
	text: string;
	number: number;
	textAndOccurrenceHash: string;
	pageId: number;
	translations: {
		text: string;
		targetLanguage: string;
	}[];
}

async function seed() {
	await addRequiredData();

	if (process.env.NODE_ENV === "development") {
		await addDevelopmentData();
	}
}

async function addRequiredData() {
	const { evame, evameEnPage, evameJaPage } = await createUserAndPages();

	const seedTexts: SeedText[] = [
		{
			text: "Write to the World",
			number: 0,
			textAndOccurrenceHash: "write-to-the-world",
			pageId: evameEnPage.id,
			translations: [
				{
					text: "世界に向けて書く",
					targetLanguage: "ja",
				},
			],
		},
		{
			text: "Evame is an innovative open-source platform that enables everyone to read articles in their native language, regardless of the original language. Through user-contributed content and collaborative translations, we break down language barriers, fostering global understanding and knowledge sharing.",
			number: 1,
			textAndOccurrenceHash:
				"evame-is-an-innovative-open-source-platform-that-enables-everyone-to-read-articles-in-their-native-language-regardless-of-the-original-language-through-user-contributed-content-and-collaborative-translations-we-break-down-language-barriers-fostering-global-understanding-and-knowledge-sharing",
			pageId: evameEnPage.id,
			translations: [
				{
					text: "Evameは、誰もが母国語で文章を読めるようにする革新的なオープンソースプラットフォームです。ユーザーによる投稿と翻訳を通じて、言語の障壁を取り除き、世界中の理解と知識の共有を促進します。",
					targetLanguage: "ja",
				},
			],
		},
		{
			text: "世界に向けて書く",
			number: 0,
			textAndOccurrenceHash: "world-to-the-world",
			pageId: evameJaPage.id,
			translations: [
				{
					text: "Write to the World",
					targetLanguage: "en",
				},
			],
		},
		{
			text: "Evameは、誰もが母国語で文章を読めるようにする革新的なオープンソースプラットフォームです。ユーザーによる投稿と翻訳を通じて、言語の障壁を取り除き、世界中の理解と知識の共有を促進します。",
			number: 1,
			textAndOccurrenceHash:
				"evame-is-an-innovative-open-source-platform-that-enables-everyone-to-read-articles-in-their-native-language-regardless-of-the-original-language-through-user-contributed-content-and-collaborative-translations-we-break-down-language-barriers-fostering-global-understanding-and-knowledge-sharing",
			pageId: evameJaPage.id,
			translations: [
				{
					text: "Evame is an innovative open-source platform that enables everyone to read articles in their native language, regardless of the original language. Through user-contributed content and collaborative translations, we break down language barriers, fostering global understanding and knowledge sharing.",
					targetLanguage: "en",
				},
			],
		},
	];

	await Promise.all(
		seedTexts.map((text) => upsertSourceTextWithTranslations(text, evame.id)),
	);

	console.log("Required data added successfully");
}

async function createUserAndPages() {
	const evame = await prisma.user.upsert({
		where: { userName: "evame" },
		update: {
			provider: "Admin",
			icon: "https://evame.tech/favicon.svg",
		},
		create: {
			userName: "evame",
			displayName: "evame",
			email: "evame@example.com",
			provider: "Admin",
			icon: "https://evame.tech/favicon.svg",
		},
	});

	const [evameEnPage, evameJaPage] = await Promise.all([
		prisma.page.upsert({
			where: { slug: "evame" },
			update: {},
			create: {
				slug: "evame",
				sourceLanguage: "en",
				content: "test",
				isPublished: false,
				userId: evame.id,
			},
		}),
		prisma.page.upsert({
			where: { slug: "evame-ja" },
			update: {},
			create: {
				slug: "evame-ja",
				sourceLanguage: "ja",
				content: "test",
				isPublished: false,
				userId: evame.id,
			},
		}),
	]);

	return { evame, evameEnPage, evameJaPage };
}

async function upsertSourceTextWithTranslations(
	sourceText: SeedText,
	userId: number,
) {
	const upsertedSourceText = await prisma.sourceText.upsert({
		where: {
			pageId_number: {
				pageId: sourceText.pageId,
				number: sourceText.number,
			},
		},
		update: {},
		create: {
			text: sourceText.text,
			number: sourceText.number,
			pageId: sourceText.pageId,
			textAndOccurrenceHash: sourceText.textAndOccurrenceHash,
		},
	});

	await Promise.all(
		sourceText.translations.map((translation) =>
			prisma.translateText.create({
				data: {
					text: translation.text,
					sourceTextId: upsertedSourceText.id,
					userId,
					targetLanguage: translation.targetLanguage,
				},
			}),
		),
	);
}

async function addDevelopmentData() {
	const email = "dev@example.com";

	const devUser = await prisma.user.upsert({
		where: { email },
		update: {},
		create: {
			email,
			userName: "dev",
			displayName: "Dev User",
			password: await bcrypt.hash("devpassword", 10),
			icon: "",
		},
	});

	console.log(`Created/Updated dev user with email: ${devUser.email}`);
}

seed()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
	await addRequiredData();

	if (process.env.NODE_ENV === "development") {
		await addDevelopmentData();
	}
}

async function addRequiredData() {
	const evame = await prisma.user.upsert({
		where: { userName: "evame" },
		update: {},
		create: {
			userName: "evame",
			displayName: "evame",
			email: "evame@example.com",
			icon: " ",
		},
	});

	const evamePage = await prisma.page.upsert({
		where: { slug: "evame" },
		update: {},
		create: {
			slug: "evame",
			sourceLanguage: "en",
			content: "test",
			isPublished: true,
			userId: evame.id,
		},
	});

	const evameJapanese = await prisma.page.upsert({
		where: { slug: "evame-ja" },
		update: {},
		create: {
			slug: "evame-ja",
			sourceLanguage: "ja",
			content: "test",
			isPublished: true,
			userId: evame.id,
		},
	});

	const sourceTexts = [
		{
			text: "Write to the World",
			number: 0,
			pageId: evamePage.id,
		},
		{
			text: "Evame is an innovative open-source platform that enables everyone to read articles in their native language, regardless of the original language. Through user-contributed content and collaborative translations, we break down language barriers, fostering global understanding and knowledge sharing.",
			number: 1,
			pageId: evamePage.id,
		},
		{
			text: "世界に向けて書く",
			number: 0,
			pageId: evameJapanese.id,
		},
		{
			text: "Evameは、誰もが自分の母国語で文章を読めるようにする革新的なオープンソースプラットフォームです。ユーザーによる投稿と翻訳を通じて、言語の障壁を取り除き、世界中の理解と知識の共有を促進します。",
			number: 1,
			pageId: evameJapanese.id,
		},
	];
	for (const sourceText of sourceTexts) {
		const existingSourceText = await prisma.sourceText.findFirst({
			where: {
				pageId: sourceText.pageId,
				number: sourceText.number,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		if (existingSourceText) {
			await prisma.sourceText.update({
				where: { id: existingSourceText.id },
				data: {
					text: sourceText.text,
				},
			});
		} else {
			await prisma.sourceText.create({
				data: sourceText,
			});
		}
	}

	console.log("Required data added successfully");
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
			provider: "Credentials",
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

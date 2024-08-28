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
	const eveeve = await prisma.user.upsert({
		where: { userName: "eveeve" },
		update: {},
		create: {
			userName: "eveeve",
			displayName: "eveeve",
			email: "eveeve@example.com",
			icon: " ",
		},
	});

	const evePage = await prisma.page.upsert({
		where: { slug: "eveeve" },
		update: {},
		create: {
			slug: "eveeve",
			title: "eveeve",
			content: "test",
			isPublished: true,
			userId: eveeve.id,
		},
	});

	await prisma.sourceText.createMany({
		data: [
			{ text: "Write to the World", number: 0, pageId: evePage.id },
			{
				text: "EveEve is an innovative open-source platform that enables everyone to read articles in their native language, regardless of the original language. Through user-contributed content and collaborative translations, we break down language barriers, fostering global understanding and knowledge sharing.",
				number: 1,
				pageId: evePage.id,
			},
		],
		skipDuplicates: true,
	});

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

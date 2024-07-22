import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
	if (process.env.NODE_ENV !== "development") {
		console.log("Seeding is only allowed in development environment");
		return;
	}

	const email = "dev@example.com";

	// 既存のユーザーをチェック
	const existingUser = await prisma.user.findUnique({
		where: { email },
	});

	if (existingUser) {
		console.log(`A user with email ${email} already exists`);
		return;
	}

	const hashedPassword = await bcrypt.hash("devpassword", 10);

	const user = await prisma.user.create({
		data: {
			email,
			name: "Dev User",
			password: hashedPassword,
			image: "",
			provider: "password",
			plan: "free",
			totalPoints: 0,
			isAI: false,
		},
	});

	console.log(`Created dev user with email: ${user.email}`);
}

seed()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

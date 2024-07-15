import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const createUser = async (
	data: Record<"name" | "email" | "password", string>,
) => {
	const { name, email, password } = data;

	if (!(name && email && password)) {
		throw new Error("Invalid input");
	}

	const existingUser = await prisma.user.findUnique({ where: { email } });

	if (existingUser) {
		return { error: { message: "メールアドレスは既に登録済みです" } };
	}

	const hashedPassword = await bcrypt.hash(data.password, 12);
	const newUser = await prisma.user.create({
		data: { name, email, password: hashedPassword },
	});

	return { id: newUser.id, email: newUser.email, name: newUser.name };
};

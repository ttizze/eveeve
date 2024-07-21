import bcrypt from "bcryptjs";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { GoogleStrategy } from "remix-auth-google";
import type { SafeUser } from "../types";
import { prisma } from "./prisma";
import { sessionStorage } from "./session.server";

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
	throw new Error("SESSION_SECRET is not defined");
}

const authenticator = new Authenticator<SafeUser>(sessionStorage);

const formStrategy = new FormStrategy(async ({ form }) => {
	const email = form.get("email");
	const password = form.get("password");

	if (!(email && password)) {
		throw new Error("Invalid Request");
	}

	const user = await prisma.user.findUnique({
		where: { email: String(email) },
	});
	console.log(user);
	if (!user) {
		throw new AuthorizationError("User not found");
	}

	if (!user.password) {
		throw new AuthorizationError("User has no password set.");
	}
	const passwordsMatch = await bcrypt.compare(String(password), user.password);

	if (!passwordsMatch) {
		throw new AuthorizationError("Invalid password");
	}

	const { password: _, geminiApiKey: __, openAIApiKey: ___, claudeApiKey: ____, ...safeUser } = user;
	return safeUser;
});

authenticator.use(formStrategy, "user-pass");

const googleStrategy = new GoogleStrategy<SafeUser>(
	{
		clientID: process.env.GOOGLE_CLIENT_ID || "",
		clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
		callbackURL: `${process.env.CLIENT_URL}/api/auth/callback/google`,
	},
	async ({ profile }) => {
		const user = await prisma.user.findUnique({
			where: { email: profile.emails[0].value },
		});
		if (user) {
			const { password, geminiApiKey, openAIApiKey, claudeApiKey, ...safeUser } = user;
			return safeUser as SafeUser;
		}
		try {
			const newUser = await prisma.user.create({
				data: {
					email: profile.emails[0].value || "",
					name: profile.displayName,
					image: profile.photos[0].value,
					provider: "google",
				},
			});
			return newUser;
		} catch (error) {
			console.error("Error creating new user:", error);
			throw new Error("Error creating new user");
		}
	},
);

authenticator.use(googleStrategy);
export { authenticator };

import type { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { GoogleStrategy } from "remix-auth-google";
import type { SanitizedUser } from "../types";
import { prisma } from "./prisma";
import { sessionStorage } from "./session.server";
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
	throw new Error("SESSION_SECRET is not defined");
}

const authenticator = new Authenticator<SanitizedUser>(sessionStorage);

const formStrategy = new FormStrategy(async ({ form }) => {
	const email = form.get("email");
	const password = form.get("password");

	if (!email || !password) {
		throw new AuthorizationError("Email and password are required");
	}

	const user = await prisma.user.findUnique({
		where: { email: String(email) },
	});
	if (!user || !user.password) {
		throw new AuthorizationError("Invalid login credentials");
	}
	const isValidPassword = await bcrypt.compare(String(password), user.password);
	if (!isValidPassword) {
		throw new AuthorizationError("Invalid login credentials");
	}

	return sanitizeUser(user);
});

authenticator.use(formStrategy, "user-pass");

const googleStrategy = new GoogleStrategy<SanitizedUser>(
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
			console.log("User found", user);
			return sanitizeUser(user);
		}

		const temporaryUserName = `new-user-${crypto.randomUUID().slice(0, 10)}-${new Date().toISOString().slice(0, 10)}`;
		const newUser = await prisma.user.create({
			data: {
				email: profile.emails[0].value || "",
				userName: temporaryUserName,
				displayName: profile.displayName || "New User",
				image: profile.photos[0].value || "",
				provider: "Google",
			},
		});
		console.log("New user created", newUser);

		return sanitizeUser(newUser);
	},
);

export function sanitizeUser(user: User): SanitizedUser {
	const {
		password,
		geminiApiKey,
		openAIApiKey,
		claudeApiKey,
		email,
		provider,
		plan,
		...sanitizedUser
	} = user;
	return sanitizedUser;
}

authenticator.use(googleStrategy);
export { authenticator };

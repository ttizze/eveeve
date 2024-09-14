import bcrypt from "bcryptjs";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { GoogleStrategy } from "remix-auth-google";
import type { SanitizedUser } from "../types";
import { prisma } from "./prisma";
import { sanitizeUser } from "./sanitizeUser";
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
	if (user.provider !== "Credentials") {
		throw new AuthorizationError(
			"This account cannot be accessed with a password",
		);
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
			return sanitizeUser(user);
		}

		const temporaryUserName = `new-user-${crypto.randomUUID().slice(0, 10)}-${new Date().toISOString().slice(0, 10)}`;
		const newUser = await prisma.user.create({
			data: {
				email: profile.emails[0].value || "",
				userName: temporaryUserName,
				displayName: profile.displayName || "New User",
				icon: profile.photos[0].value || "",
				provider: "Google",
			},
		});
		console.log("New user created", newUser);

		return sanitizeUser(newUser);
	},
);

authenticator.use(googleStrategy);
export { authenticator };

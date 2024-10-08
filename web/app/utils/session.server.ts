import { createCookieSessionStorage } from "@remix-run/node";
import type { SanitizedUser } from "~/types";

type Session = {
	user?: SanitizedUser;
};

export const sessionStorage = createCookieSessionStorage<Session>({
	cookie: {
		name: "_session",
		sameSite: "lax",
		path: "/",
		httpOnly: true,
		secrets: [process.env.SESSION_SECRET || ""],
		secure: process.env.NODE_ENV === "production",
		maxAge: 60 * 60 * 24 * 30,
	},
});

export const { getSession, commitSession, destroySession } = sessionStorage;

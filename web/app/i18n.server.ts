import { createCookie } from "@remix-run/node";
import { RemixI18Next } from "remix-i18next/server";
import * as i18n from "~/utils/i18n";

export const localeCookie = createCookie("targetLanguage", {
	path: "/",
	sameSite: "lax",
	secure: process.env.NODE_ENV === "production",
	httpOnly: true,
});

export default new RemixI18Next({
	detection: {
		supportedLanguages: i18n.supportedLngs,
		fallbackLanguage: i18n.fallbackLng,
		cookie: localeCookie,
	},
	// This is the configuration for i18next used
	// when translating messages server-side only
	i18next: {
		...i18n,
		// You can add extra keys here
	},
});

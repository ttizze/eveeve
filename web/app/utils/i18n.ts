import { targetLanguages } from "~/constants/languages";
export const supportedLngs = targetLanguages.map((language) => language.code);
export const fallbackLng = "en";
export const defaultNS = "translation";

export const resources = supportedLngs.reduce(
	(acc, lang) => {
		try {
			const translations = require(`public/locales/${lang}.json`);
			acc[lang] = { translation: translations };
		} catch (error) {
			acc[lang] = { translation: {} };
		}
		return acc;
	},
	{} as Record<string, { translation: Record<string, string> }>,
);

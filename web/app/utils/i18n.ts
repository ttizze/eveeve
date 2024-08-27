import en from "public/locales/en";
import es from "public/locales/es";
import ja from "public/locales/ja";

// This is the list of languages your application supports,
// the fallback is always the last
export const supportedLngs = ["es", "en", "ja"];

// This is the language you want to use in case
// if the user preferred language is not in the supportedLngs
export const fallbackLng = "en";

// The default namespace of i18next is "translation", but you can customize it
// here
export const defaultNS = "translation";

// These are the translation files we created, `translation` is the namespace
// we want to use, we'll use this to include the translations in the bundle
// instead of loading them on-demand
export const resources = {
	en: { translation: en },
	es: { translation: es },
	ja: { translation: ja },
};

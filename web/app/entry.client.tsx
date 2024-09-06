import * as Sentry from "@sentry/remix";
/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { RemixBrowser, useLocation, useMatches } from "@remix-run/react";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { StrictMode, startTransition, useEffect } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { getInitialNamespaces } from "remix-i18next/client";
import * as i18n from "~/utils/i18n";

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	tracesSampleRate: 1,
	replaysSessionSampleRate: 0.1,
	replaysOnErrorSampleRate: 1,

	integrations: [
		Sentry.browserTracingIntegration({
			useEffect,
			useLocation,
			useMatches,
		}),
		Sentry.replayIntegration(),
	],
});

async function main() {
	await i18next
		.use(initReactI18next) // Tell i18next to use the react-i18next plugin
		.use(LanguageDetector) // Setup a client-side language detector
		.use(Backend) // Setup your backend
		.init({
			...i18n, // spread the configuration
			// This function detects the namespaces your routes rendered while SSR use
			ns: getInitialNamespaces(),
			detection: {
				// Here only enable htmlTag detection, we'll detect the language only
				// server-side with remix-i18next, by using the `<html lang>` attribute
				// we can communicate to the client the language detected server-side
				order: ["htmlTag"],
				// Because we only use htmlTag, there's no reason to cache the language
				// on the browser, so we disable it
				caches: [],
			},
		});

	startTransition(() => {
		hydrateRoot(
			document,
			<I18nextProvider i18n={i18next}>
				<StrictMode>
					<RemixBrowser />
				</StrictMode>
			</I18nextProvider>,
		);
	});
}
main().catch((error) => console.error(error));

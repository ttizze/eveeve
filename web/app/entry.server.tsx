import * as Sentry from "@sentry/remix";
/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { PassThrough } from "node:stream";

import type { AppLoadContext, EntryContext } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter } from "react-router";
import { createInstance } from "i18next";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import i18nServer from "./i18n.server";
import * as i18n from "./utils/i18n";

export const handleError = Sentry.wrapHandleErrorWithSentry(
	(error, { request }) => {
		// Custom handleError implementation
	},
);

export const streamTimeout = 5000;
function setSecurityHeaders(headers: Headers) {
	headers.set(
		"Strict-Transport-Security",
		"max-age=31536000; includeSubDomains; preload",
	);
	headers.set("Content-Security-Policy", "frame-ancestors 'self';");
	headers.set("X-Content-Type-Options", "nosniff");
}

export default async function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	reactRouterContext: EntryContext,
	// This is ignored so we can keep it in the template for visibility.  Feel
	// free to delete this parameter in your app if you're not using it!
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	loadContext: AppLoadContext,
) {
	return isbot(request.headers.get("user-agent") || "")
		? handleBotRequest(
				request,
				responseStatusCode,
				responseHeaders,
				reactRouterContext,
			)
		: handleBrowserRequest(
				request,
				responseStatusCode,
				responseHeaders,
				reactRouterContext,
			);
}

async function handleBotRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	reactRouterContext: EntryContext,
) {
	const instance = createInstance();
	const lng = await i18nServer.getLocale(request);
	const ns = i18nServer.getRouteNamespaces(reactRouterContext);

	await instance.use(initReactI18next).init({
		...i18n,
		lng,
		ns,
	});

	return new Promise((resolve, reject) => {
		let shellRendered = false;
		let currentResponseStatusCode = responseStatusCode;
		const { pipe, abort } = renderToPipeableStream(
			<I18nextProvider i18n={instance}>
				<ServerRouter context={reactRouterContext} url={request.url} />
			</I18nextProvider>,
			{
				onAllReady() {
					shellRendered = true;
					const body = new PassThrough();
					const stream = createReadableStreamFromReadable(body);

					responseHeaders.set("Content-Type", "text/html");
					setSecurityHeaders(responseHeaders);

					resolve(
						new Response(stream, {
							headers: responseHeaders,
							status: currentResponseStatusCode,
						}),
					);

					pipe(body);
				},
				onShellError(error: unknown) {
					reject(error);
				},
				onError(error: unknown) {
					currentResponseStatusCode = 500;
					// Log streaming rendering errors from inside the shell.  Don't log
					// errors encountered during initial shell rendering since they'll
					// reject and get logged in handleDocumentRequest.
					if (shellRendered) {
						console.error(error);
					}
				},
			},
		);

		setTimeout(abort, streamTimeout + 1000);
	});
}

async function handleBrowserRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	reactRouterContext: EntryContext,
) {
	const instance = createInstance();
	const lng = await i18nServer.getLocale(request);
	const ns = i18nServer.getRouteNamespaces(reactRouterContext);

	await instance.use(initReactI18next).init({
		...i18n,
		lng,
		ns,
	});

	return new Promise((resolve, reject) => {
		let shellRendered = false;
		let currentResponseStatusCode = responseStatusCode;
		const { pipe, abort } = renderToPipeableStream(
			<I18nextProvider i18n={instance}>
				<ServerRouter context={reactRouterContext} url={request.url} />
			</I18nextProvider>,
			{
				onShellReady() {
					shellRendered = true;
					const body = new PassThrough();
					const stream = createReadableStreamFromReadable(body);

					responseHeaders.set("Content-Type", "text/html");
					setSecurityHeaders(responseHeaders);
					resolve(
						new Response(stream, {
							headers: responseHeaders,
							status: currentResponseStatusCode,
						}),
					);

					pipe(body);
				},
				onShellError(error: unknown) {
					reject(error);
				},
				onError(error: unknown) {
					currentResponseStatusCode = 500;
					// Log streaming rendering errors from inside the shell.  Don't log
					// errors encountered during initial shell rendering since they'll
					// reject and get logged in handleDocumentRequest.
					if (shellRendered) {
						console.error(error);
					}
				},
			},
		);

		setTimeout(abort, streamTimeout + 1000);
	});
}

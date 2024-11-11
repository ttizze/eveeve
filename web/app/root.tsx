import type { LinksFunction } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { data } from "@remix-run/node";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
	useRouteError,
} from "@remix-run/react";
import { useLocation } from "@remix-run/react";
import { useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { captureRemixErrorBoundaryError, withSentry } from "@sentry/remix";
import { useEffect } from "react";
import { useChangeLanguage } from "remix-i18next/react";
import { useHydrated } from "remix-utils/use-hydrated";
import { ThemeProvider } from "~/components/theme-provider";
import * as gtag from "~/gtags.client";
import i18nServer, { localeCookie } from "~/i18n.server";
import { Footer } from "~/routes/resources+/footer";
import { Header } from "~/routes/resources+/header";
import tailwind from "~/tailwind.css?url";
import { authenticator } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const isDevelopment = process.env.NODE_ENV === "development";

	const gaTrackingId = isDevelopment
		? ""
		: (process.env.GOOGLE_ANALYTICS_ID ?? "");
	const currentUser = await authenticator.isAuthenticated(request);
	const locale = (await i18nServer.getLocale(request)) || "en";
	return data(
		{
			isDevelopment,
			currentUser,
			locale,
			gaTrackingId,
		},
		{
			headers: { "Set-Cookie": await localeCookie.serialize(locale) },
		},
	);
}

export const handle = {
	i18n: "translation",
};

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: tailwind },
];

export function Layout({ children }: { children: React.ReactNode }) {
	const data = useRouteLoaderData<typeof loader>("root");
	const { gaTrackingId, locale } = data ?? {};
	const location = useLocation();
	useEffect(() => {
		if (gaTrackingId?.length) {
			gtag.pageview(location.pathname, gaTrackingId);
		}
	}, [location, gaTrackingId]);
	return (
		<html lang={locale ?? "en"} suppressHydrationWarning={true}>
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, maximum-scale=1"
				/>
				<Meta />
				<Links />
			</head>
			<body className="flex flex-col min-h-screen">
				{!gaTrackingId ? null : (
					<>
						<script
							async
							src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
						/>
						<script
							async
							id="gtag-init"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
							dangerouslySetInnerHTML={{
								__html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaTrackingId}', {
                  page_path: window.location.pathname,
                });
              `,
							}}
						/>
					</>
				)}
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

function App() {
	const { locale } = useLoaderData<typeof loader>();
	useChangeLanguage(locale);
	const location = useLocation();
	const isSpecialLayout =
		/^\/\w+\/page\/[\w-]+\/edit$/.test(location.pathname) ||
		location.pathname === "/welcome";

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<CommonLayout isSpecialLayout={isSpecialLayout}>
				<Outlet />
			</CommonLayout>
		</ThemeProvider>
	);
}

export default withSentry(App);

function CommonLayout({
	children,
	isSpecialLayout = true,
}: { children: React.ReactNode; isSpecialLayout: boolean }) {
	const { currentUser } = useLoaderData<typeof loader>();

	if (isSpecialLayout) {
		return <>{children}</>;
	}

	return (
		<>
			<Header currentUser={currentUser} />
			<main className="mb-5 mt-3 md:mt-5 flex-grow">
				<div className="mx-auto px-2 md:container">{children}</div>
			</main>
			<Footer />
		</>
	);
}

export function ErrorBoundary() {
	const data = useRouteLoaderData<typeof loader>("root");
	const isDevelopment = data?.isDevelopment;
	const error = useRouteError();
	const isHydrated = useHydrated();
	captureRemixErrorBoundaryError(error);

	if (isDevelopment) {
		console.error(error);
		return (
			<div className="text-left p-4 bg-red-100 border border-red-400 rounded">
				<pre className="whitespace-pre-wrap break-words">
					{isRouteErrorResponse(error)
						? `${error.status} ${error.statusText}`
						: error instanceof Error
							? error.stack
							: JSON.stringify(error, null, 2)}
				</pre>
			</div>
		);
	}

	return !isHydrated ? null : (
		<div className="text-center flex flex-col items-center justify-center min-h-screen bg-gray-100">
			{isRouteErrorResponse(error) ? (
				<>
					<h1 className="text-6xl font-bold text-gray-800 mb-4">
						{error.status}
					</h1>
					<p className="text-2xl text-gray-600 mb-8">
						{error.status === 404 ? "Page not found" : error.statusText}
					</p>
				</>
			) : error instanceof Error ? (
				<>
					<h1 className="text-6xl font-bold text-gray-800 mb-4">Error</h1>
					<p className="text-2xl text-gray-600 mb-8">{error.message}</p>
				</>
			) : (
				<h1 className="text-6xl font-bold text-gray-800 mb-4">Unknown error</h1>
			)}
			<a
				href="/"
				className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
			>
				Back to home
			</a>
		</div>
	);
}

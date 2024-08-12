import type { LinksFunction } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react";
import { useLocation } from "@remix-run/react";
import { typedjson } from "remix-typedjson";
import { useTypedLoaderData } from "remix-typedjson";
import { ThemeProvider } from "~/components/theme-provider";
import { Footer } from "~/routes/resources+/footer";
import { Header } from "~/routes/resources+/header";
import tailwind from "~/tailwind.css?url";
import { authenticator } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const safeUser = await authenticator.isAuthenticated(request);
	return typedjson({ safeUser });
}
export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: tailwind },
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ja">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

function CommonLayout({ children }: { children: React.ReactNode }) {
	const { safeUser } = useTypedLoaderData<typeof loader>();
	return (
		<>
			<Header safeUser={safeUser} />
			<div className="container mx-auto">{children}</div>
			<Footer safeUser={safeUser} />
		</>
	);
}

export default function App() {
	const location = useLocation();
	const isEditPage = /^\/\w+\/page\/[\w-]+\/edit$/.test(location.pathname);

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			{isEditPage ? (
				<Outlet />
			) : (
				<CommonLayout>
					<Outlet />
				</CommonLayout>
			)}
		</ThemeProvider>
	);
}

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
	const currentUser = await authenticator.isAuthenticated(request);
	return typedjson({ currentUser });
}
export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: tailwind },
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ja">
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, maximum-scale=1"
				/>
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

function CommonLayout({
	children,
	showHeaderFooter = true,
}: { children: React.ReactNode; showHeaderFooter?: boolean }) {
	const { currentUser } = useTypedLoaderData<typeof loader>();
	return (
		<>
			{showHeaderFooter && <Header currentUser={currentUser} />}
			<div className="flex flex-col min-h-screen">
				<main className="flex-grow">
					<div className="container mx-auto">{children}</div>
				</main>
				{showHeaderFooter && <Footer currentUser={currentUser} />}
			</div>
		</>
	);
}

export default function App() {
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
			<CommonLayout showHeaderFooter={!isSpecialLayout}>
				<Outlet />
			</CommonLayout>
		</ThemeProvider>
	);
}

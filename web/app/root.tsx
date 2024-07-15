import type { User } from "@prisma/client";
import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { LinksFunction } from "@remix-run/node";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";
import tailwind from "~/tailwind.css?url";
import { commitSession, getSession } from "~/utils/session.server";
import { Header } from "./components/Header";
import { authenticator } from "./utils/auth.server";

type UserWithoutPassword = Omit<User, "password">;

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: tailwind },
];
export interface RootLoaderData {
	user: UserWithoutPassword | null;
	language: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await authenticator.isAuthenticated(request);
	const safeUser = user ? { ...user, password: undefined } : null;

	const session = await getSession(request.headers.get("Cookie"));
	const language = session.get("language") || "ja";

	return json(
		{ user: safeUser, language },
		{
			headers: {
				"Set-Cookie": await commitSession(session),
			},
		},
	);
}

export async function action({ request }: ActionFunctionArgs) {
	const session = await getSession(request.headers.get("Cookie"));
	const formData = await request.formData();
	const language = formData.get("language");

	if (typeof language === "string") {
		session.set("language", language);
	}

	return json(
		{ success: true },
		{
			headers: {
				"Set-Cookie": await commitSession(session),
			},
		},
	);
}

export function Layout({ children }: { children: React.ReactNode }) {
	const data = useLoaderData<typeof loader>();
	const user = data?.user as UserWithoutPassword | null;

	return (
		<html lang={data.language}>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<Header
					user={user as UserWithoutPassword | null}
					language={data.language}
				/>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

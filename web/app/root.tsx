import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react";
import "./tailwind.css";
import type { User } from "@prisma/client";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Header } from "./components/Header";
import { authenticator } from "./utils/auth.server";

type UserWithoutPassword = Omit<User, "password">;

export interface RootLoaderData {
	user: UserWithoutPassword | null;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await authenticator.isAuthenticated(request);
	const safeUser = user ? { ...user, password: undefined } : null;
	return json<RootLoaderData>({ user: safeUser });
}
export function Layout({ children }: { children: React.ReactNode }) {
	const { user } = useLoaderData<RootLoaderData>();

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<Header user={user as UserWithoutPassword | null} />
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

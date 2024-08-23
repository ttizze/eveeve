import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Form } from "@remix-run/react";
import { LogIn, Search } from "lucide-react";
import { NewPageButton } from "~/components/NewPageButton";
import { ModeToggle } from "~/components/dark-mode-toggle";
import { Button } from "~/components/ui/button";
import type { SanitizedUser } from "~/types";
import { authenticator } from "~/utils/auth.server";

interface HeaderProps {
	currentUser: SanitizedUser | null;
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.clone().formData();
	const intent = formData.get("intent");

	if (intent === "logout") {
		return await authenticator.logout(request, { redirectTo: "/" });
	}

	if (intent === "SignInWithGoogle") {
		const user = await authenticator.authenticate("google", request);

		if (user) {
			if (user.userName) {
				return redirect(`/${user.userName}`);
			}
			return redirect("/welcome");
		}

		return redirect("/auth/login");
	}

	return json({ error: "Invalid intent" }, { status: 400 });
}

export function Header({ currentUser }: HeaderProps) {
	return (
		<header className="shadow-sm z-10 ">
			<div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
				<Link to="/">
					<h1 className="text-4xl font-bold">EveEve</h1>
				</Link>
				<div className="flex items-center">
					<Button variant="ghost">
						<Link
							to="/search"
							className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
						>
							<Search className="w-6 h-6" />
						</Link>
					</Button>
					<ModeToggle />
					{currentUser ? (
						<NewPageButton userName={currentUser.userName} />
					) : (
						<Form method="post" action="/resources/header">
							<Button
								type="submit"
								name="intent"
								value="SignInWithGoogle"
								variant="ghost"
								className="w-full items-center"
							>
								<LogIn className="w-6 h-6" />
							</Button>
						</Form>
					)}
				</div>
			</div>
		</header>
	);
}

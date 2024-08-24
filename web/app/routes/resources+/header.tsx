import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Form } from "@remix-run/react";
import { LogIn, Search } from "lucide-react";
import { NewPageButton } from "~/components/NewPageButton";
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
			<div className="max-w-7xl mx-auto py-2 md:py-4 px-2 md:px-6 lg:px-8 flex justify-between items-center">
				<Link to="/">
					<h1 className="text-2xl font-bold">EveEve</h1>
				</Link>
				<div className="grid grid-cols-3 gap-0 items-center">
					<Button variant="ghost" type="button">
						<Link
							to="/search"
							className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white justify-self-start"
						>
							<Search className="w-6 h-6" />
						</Link>
					</Button>
					{currentUser ? (
						<>
							<Button
								className="col-span-1 justify-self-center"
								type="button"
								variant="ghost"
							>
								<Link to={`/${currentUser.userName}`}>
									<img
										src={currentUser.icon}
										alt={currentUser.displayName}
										className="w-6 h-6 rounded-full"
									/>
								</Link>
							</Button>
							<div className="col-span-1">
								<NewPageButton userName={currentUser.userName} />
							</div>
						</>
					) : (
						<Form
							method="post"
							action="/resources/header"
							className="col-span-2 justify-self-end"
						>
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

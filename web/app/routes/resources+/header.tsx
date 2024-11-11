import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Form } from "@remix-run/react";
import { HomeIcon, LogOutIcon, Search } from "lucide-react";
import { ModeToggle } from "~/components/ModeToggle";
import { NewPageButton } from "~/components/NewPageButton";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
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
			return redirect(`/${user.userName}`);
		}

		return redirect("/auth/login");
	}

	return json({ error: "Invalid intent" }, { status: 400 });
}

export function Header({ currentUser }: HeaderProps) {
	return (
		<header className="z-10 ">
			<div className="max-w-7xl mx-auto py-2 md:py-4 px-2 md:px-6 lg:px-8 flex justify-between items-center">
				<Link to="/home">
					<h1 className="text-2xl font-bold">EveEve</h1>
				</Link>
				<div className="grid grid-cols-2 gap-6 items-center mr-2">
					<Link
						to="/search"
						className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white justify-self-center"
					>
						<Search className="w-6 h-6" />
					</Link>
					{currentUser ? (
						<>
							<DropdownMenu>
								<DropdownMenuTrigger>
									<img
										src={currentUser.icon}
										alt={currentUser.displayName}
										className="w-6 h-6 rounded-full"
									/>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem asChild>
										<NewPageButton userName={currentUser.userName} />
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link
											to={`/${currentUser.userName}`}
											className="flex items-center gap-2 justify-start w-full text-left px-4 py-2 cursor-pointer"
										>
											<HomeIcon className="w-4 h-4" />
											Home
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<ModeToggle />
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Form
											method="post"
											action="/resources/header"
											className="w-full !p-0"
										>
											<Button
												type="submit"
												name="intent"
												value="logout"
												variant="ghost"
												className="gap-2 justify-start w-full text-left px-4 py-2 text-red-500"
											>
												<LogOutIcon className="w-4 h-4" />
												Log out
											</Button>
										</Form>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</>
					) : (
						<Form
							method="post"
							action="/resources/header"
							className="w-full  !p-0"
						>
							<Button
								type="submit"
								name="intent"
								value="SignInWithGoogle"
								variant="ghost"
								className="gap-2  justify-start w-full text-left px-4 py-2"
							>
								Start
							</Button>
						</Form>
					)}
				</div>
			</div>
		</header>
	);
}

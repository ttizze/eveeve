import { data } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Form } from "@remix-run/react";
import { NavLink } from "@remix-run/react";
import { LogOutIcon, Search, SettingsIcon } from "lucide-react";
import { StartButton } from "~/components/StartButton";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { SanitizedUser } from "~/types";
import { authenticator } from "~/utils/auth.server";
import { ModeToggle } from "../../components/ModeToggle";
import { NewPageButton } from "./components/NewPageButton";
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

	return data({ error: "Invalid intent" }, { status: 400 });
}

export function Header({ currentUser }: HeaderProps) {
	return (
		<header className="z-10 ">
			<div className="max-w-7xl mx-auto py-2 md:py-4 px-2 md:px-6 lg:px-8 flex justify-between items-center">
				<Link to="/home">
					<img
						src="/logo.svg"
						alt="Evame"
						className="h-6 w-auto  dark:invert"
						aria-label="Evame Logo"
					/>
				</Link>
				<div
					className={`grid ${currentUser ? "grid-cols-3" : "grid-cols-2"} gap-3 items-center mr-2`}
				>
					<NavLink
						to="/search"
						className={({ isPending }) =>
							isPending
								? "opacity-50"
								: "opacity-100 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white justify-self-end"
						}
					>
						<Search className="w-6 h-6 " />
					</NavLink>
					{currentUser ? (
						<>
							<NewPageButton userName={currentUser.userName} />
							<DropdownMenu>
								<DropdownMenuTrigger>
									<Avatar className="w-6 h-6">
										<AvatarImage
											src={currentUser.icon}
											alt={currentUser.displayName}
										/>
										<AvatarFallback>
											{currentUser.displayName.charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="m-2 p-0 rounded-xl min-w-40">
									<DropdownMenuItem asChild>
										<NavLink
											to={`/${currentUser.userName}`}
											className={({ isPending }) =>
												isPending
													? "opacity-50"
													: "opacity-100 w-full  px-4 py-3 cursor-pointer hover:bg-accent hover:text-accent-foreground"
											}
										>
											<div className="flex flex-col items-start">
												{currentUser.displayName}
												<span className="text-xs text-gray-500">
													@{currentUser.userName}
												</span>
											</div>
										</NavLink>
									</DropdownMenuItem>
									<DropdownMenuSeparator className="my-0" />
									<DropdownMenuItem asChild>
										<Link
											to={`/${currentUser.userName}/page-management`}
											className="w-full rounded-none flex items-center gap-2 justify-start  text-left px-4 py-3 cursor-pointer hover:bg-accent hover:text-accent-foreground"
										>
											<SettingsIcon className="w-4 h-4" />
											Page Management
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
											<button
												type="submit"
												name="intent"
												value="logout"
												className="w-full gap-2 flex cursor-pointer items-center  px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground text-red-500"
											>
												<LogOutIcon className="w-4 h-4" />
												Log out
											</button>
										</Form>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</>
					) : (
						<StartButton />
					)}
				</div>
			</div>
		</header>
	);
}

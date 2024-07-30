import { Link } from "@remix-run/react";
import { Form } from "@remix-run/react";
import { Languages, LogIn, LogOut, Search, User } from "lucide-react";
import { TargetLanguageSelect } from "~/components/TargetLanguageSelect";
import { ModeToggle } from "~/components/dark-mode-toggle";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import type { SafeUser } from "~/types";
import { useTheme } from "next-themes";
interface HeaderProps {
	safeUser: SafeUser | null;
}

export function Header({ safeUser }: HeaderProps) {
	const { theme } = useTheme();

	return (
		<header className="shadow-sm mb-10 z-10 ">
			<div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
				<Link to="/">
					<img src={`/title-logo-${theme}.png`} alt="" className="w-40" />
				</Link>
				<div className="flex items-center space-x-4">
					<Button variant="ghost" size="icon">
						<Link
							to="/search"
							className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
						>
							<Search className="w-6 h-6" />
						</Link>
					</Button>
					<ModeToggle />
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger>
							<Button variant="ghost" size="icon">
								<User className="w-6 h-6" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem className="h-12">
								<Languages className="w-4 h-4 mr-3" />
								<TargetLanguageSelect />
							</DropdownMenuItem>
							<Separator />
							{safeUser ? (
								<DropdownMenuItem className="h-12">
									<Link to="/auth/logout" className="w-full flex items-center">
										<LogOut className="w-4 h-4 mr-3" />
										Log out
									</Link>
								</DropdownMenuItem>
							) : (
								<DropdownMenuItem className="h-12">
									<Form method="post" className="w-full">
										<Button
											type="submit"
											name="intent"
											value="SignInWithGoogle"
											variant="ghost"
											className="w-full items-center"
										>
											<LogIn className="w-4 h-4 mr-2" />
											Sign In
										</Button>
									</Form>
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}

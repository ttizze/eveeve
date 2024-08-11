import { Link } from "@remix-run/react";
import { Form } from "@remix-run/react";
import { LogIn, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { NewPageButton } from "~/components/NewPageButton";
import { ModeToggle } from "~/components/dark-mode-toggle";
import { Button } from "~/components/ui/button";
import type { SafeUser } from "~/types";

interface HeaderProps {
	safeUser: SafeUser | null;
}

export function Header({ safeUser }: HeaderProps) {
	const { resolvedTheme } = useTheme();

	return (
		<header className="shadow-sm mb-10 z-10 ">
			<div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
				<Link to="/">
					<img
						src={`/title-logo-${resolvedTheme || "light"}.png `}
						alt=""
						className="w-40"
					/>
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
					{safeUser ? (
						<>
							<NewPageButton userId={safeUser.id} />
						</>
					) : (
						<Form method="post" className="w-full">
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

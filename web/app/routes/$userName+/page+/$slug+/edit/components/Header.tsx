import { Link } from "@remix-run/react";
import { ArrowLeft, LogIn } from "lucide-react";
import { ModeToggle } from "~/components/dark-mode-toggle";
import { Button } from "~/components/ui/button";
import type { SafeUser } from "~/types";

interface HeaderProps {
	safeUser: SafeUser | null;
}

export function Header({ safeUser }: HeaderProps) {
	return (
		<header className="mb-10 z-10 ">
			<div className="max-w-7xl mx-auto py-4 px-4 sm:px-6  flex justify-between items-center">
				<Button variant="ghost">
					<Link
						to={`/${safeUser?.userName}`}
						className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
					>
						<ArrowLeft className="w-6 h-6" />
					</Link>
				</Button>
				<div className="flex items-center">
					<ModeToggle />
					<Button
						type="submit"
						name="intent"
						value="SignInWithGoogle"
						variant="ghost"
						className="w-full items-center"
					>
						<LogIn className="w-6 h-6" />
					</Button>
				</div>
			</div>
		</header>
	);
}

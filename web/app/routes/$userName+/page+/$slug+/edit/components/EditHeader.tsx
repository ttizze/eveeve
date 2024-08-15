import { Link } from "@remix-run/react";
import { useNavigation } from "@remix-run/react";
import { ArrowDownToLine, ArrowLeft, Loader2 } from "lucide-react";
import { ModeToggle } from "~/components/dark-mode-toggle";
import { Button } from "~/components/ui/button";
import type { SanitizedUser } from "~/types";
interface EditHeaderProps {
	currentUser: SanitizedUser | null;
}

export function EditHeader({ currentUser }: EditHeaderProps) {
	const navigation = useNavigation();
	const isLoading = navigation.state === "loading";

	return (
		<header className="mb-10 z-10 ">
			<div className="max-w-7xl mx-auto py-4 px-4 sm:px-6  flex justify-between items-center">
				<Button variant="ghost">
					<Link
						to={`/${currentUser?.userName}`}
						className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
					>
						{isLoading ? (
							<Loader2 className="w-6 h-6 animate-spin" />
						) : (
							<ArrowLeft className="w-6 h-6" />
						)}
					</Link>
				</Button>
				<Button type="submit" variant="ghost">
					<ArrowDownToLine className="w-6 h-6 mr-2" />
					Save
				</Button>
				<div className="flex items-center">
					<ModeToggle />
				</div>
			</div>
		</header>
	);
}

import { Link } from "@remix-run/react";
import { useNavigation } from "@remix-run/react";
import { ArrowDownToLine, ArrowLeft, Loader2 } from "lucide-react";
import { ModeToggle } from "~/components/dark-mode-toggle";
import { Button } from "~/components/ui/button";
import type { SanitizedUser } from "~/types";
interface EditHeaderProps {
	currentUser: SanitizedUser | null;
	pageSlug: string | null;
}

export function EditHeader({ currentUser, pageSlug }: EditHeaderProps) {
	const navigation = useNavigation();
	const isLoading = navigation.state === "loading";
	const getLinkDetails = () => {
		const basePath = `/${currentUser?.userName}`;
		return pageSlug ? `${basePath}/page/${pageSlug}` : basePath;
	};
	return (
		<header className="mb-10 z-10 ">
			<div className="max-w-7xl mx-auto py-4 px-4 sm:px-6  flex justify-between items-center">
				<Button variant="ghost">
					<Link
						to={getLinkDetails()}
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
					{isLoading ? (
						<Loader2 className="w-6 h-6 animate-spin" />
					) : (
						<ArrowDownToLine className="w-6 h-6 mr-2" />
					)}
					Save
				</Button>
				<div className="flex items-center">
					<ModeToggle />
				</div>
			</div>
		</header>
	);
}

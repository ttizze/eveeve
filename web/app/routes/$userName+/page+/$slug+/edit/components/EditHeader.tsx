import { Link } from "@remix-run/react";
import type { Fetcher } from "@remix-run/react";
import { ArrowDownToLine, ArrowLeft, Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ModeToggle } from "~/components/dark-mode-toggle";
import { Button } from "~/components/ui/button";
import type { SanitizedUser } from "~/types";

interface EditHeaderProps {
	currentUser: SanitizedUser | null;
	pageSlug: string | null;
	fetcher: Fetcher;
}

export function EditHeader({
	currentUser,
	pageSlug,
	fetcher,
}: EditHeaderProps) {
	const isSubmitting = fetcher.state === "submitting";
	const isLoading = fetcher.state === "loading";
	const [showSuccess, setShowSuccess] = useState(false);

	useEffect(() => {
		if (fetcher.state === "loading") {
			setShowSuccess(true);
		} else if (fetcher.state === "idle" && showSuccess) {
			const timer = setTimeout(() => setShowSuccess(false), 500);
			return () => clearTimeout(timer);
		}
	}, [fetcher.state, showSuccess]);

	return (
		<header className="mb-10 z-10 ">
			<div className="max-w-7xl mx-auto py-4 px-4 sm:px-6  flex justify-between items-center">
				<Button variant="ghost">
					<Link
						to={
							pageSlug
								? `/${currentUser?.userName}/page/${pageSlug}`
								: `/${currentUser?.userName}`
						}
						className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
					>
						{isLoading ? (
							<Loader2 className="w-6 h-6 animate-spin" />
						) : (
							<ArrowLeft className="w-6 h-6" />
						)}
					</Link>
				</Button>
				<Button type="submit" variant="ghost" disabled={isSubmitting}>
					{isSubmitting ? (
						<>
							<Loader2 className="w-6 h-6 animate-spin" />
						</>
					) : showSuccess ? (
						<>
							<Check className="w-6 h-6 " />
						</>
					) : (
						<>
							<ArrowDownToLine className="w-6 h-6 mr-2" />
							Save
						</>
					)}
				</Button>
				<div className="flex items-center">
					<ModeToggle />
				</div>
			</div>
		</header>
	);
}

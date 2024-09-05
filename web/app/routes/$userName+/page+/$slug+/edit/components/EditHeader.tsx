import { Link } from "@remix-run/react";
import type { FetcherWithComponents } from "@remix-run/react";
import {
	ArrowDownToLine,
	ArrowLeft,
	ArrowUpFromLine,
	Check,
	Globe,
	Loader2,
	Lock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { SanitizedUser } from "~/types";

interface EditHeaderProps {
	currentUser: SanitizedUser | null;
	pageSlug: string | null;
	initialIsPublished: boolean;
	fetcher: FetcherWithComponents<unknown>;
	hasUnsavedChanges: boolean;
}

export function EditHeader({
	currentUser,
	pageSlug,
	initialIsPublished,
	fetcher,
	hasUnsavedChanges,
}: EditHeaderProps) {
	const isSubmitting = fetcher.state === "submitting";
	const isLoading = fetcher.state === "loading";
	const [isPublished, setIsPublished] = useState(initialIsPublished);
	const [showSuccess, setShowSuccess] = useState(false);

	const handlePublishToggle = (newPublishState: boolean) => {
		setIsPublished(newPublishState);
	};
	useEffect(() => {
		if (fetcher.state === "loading") {
			setShowSuccess(true);
		}
		if (hasUnsavedChanges) {
			setShowSuccess(false);
		}
	}, [fetcher.state, hasUnsavedChanges]);

	const renderButtonIcon = () => {
		if (isSubmitting) {
			return <Loader2 className="w-6 h-6 animate-spin" />;
		}
		if (showSuccess) {
			return <Check className="w-6 h-6" />;
		}
		return (
			<>
				{isPublished ? (
					<div className="flex justify-center items-center space-x-2">
						<ArrowUpFromLine className="w-5 h-5 mr-2" />
						Publish
					</div>
				) : (
					<div className="flex justify-center items-center space-x-2">
						<ArrowDownToLine className="w-5 h-5 mr-2" />
						Save
					</div>
				)}
			</>
		);
	};

	return (
		<header className="sticky top-0 z-10 pt-2 bg-blur">
			<div className="grid grid-cols-3 items-center">
				<div className="justify-self-start">
					<Link
						to={
							pageSlug
								? `/${currentUser?.userName}/page/${pageSlug}`
								: `/${currentUser?.userName}`
						}
						className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
					>
						<Button variant="ghost" type="button">
							{isLoading ? (
								<Loader2 className="w-6 h-6 animate-spin" />
							) : (
								<ArrowLeft className="w-6 h-6 opacity-50" />
							)}
						</Button>
					</Link>
				</div>
				<div className="justify-self-center">
					<Button
						type="submit"
						variant="ghost"
						disabled={isSubmitting || !hasUnsavedChanges}
					>
						{renderButtonIcon()}
					</Button>
					<input
						type="hidden"
						name="isPublished"
						value={isPublished ? "true" : "false"}
					/>
				</div>
				<div className="justify-self-end">
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="ml-auto" type="button">
								{isPublished ? (
									<Globe className="w-5 h-5  mr-2" />
								) : (
									<Lock className="w-5 h-5 text-gray-500 mr-2" />
								)}
								{isPublished ? (
									"Public"
								) : (
									<span className="text-gray-500">Private</span>
								)}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onSelect={() => handlePublishToggle(false)}>
								<Lock className="mr-2 h-4 w-4" />
								<span className="text-gray-500">Set to Private</span>
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => handlePublishToggle(true)}>
								<Globe className="mr-2 h-4 w-4" />
								<span>Set to Public</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}

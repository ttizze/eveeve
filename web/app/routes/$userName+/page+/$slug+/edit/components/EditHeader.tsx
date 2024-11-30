import type { FetcherWithComponents } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { Form } from "@remix-run/react";
import {
	Check,
	Globe,
	Loader2,
	Lock,
	LogOutIcon,
	SettingsIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ModeToggle } from "~/components/ModeToggle";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import type { SanitizedUser } from "~/types";

interface EditHeaderProps {
	currentUser: SanitizedUser;
	pageSlug: string | undefined;
	initialIsPublished: boolean | undefined;
	fetcher: FetcherWithComponents<unknown>;
	hasUnsavedChanges: boolean;
	setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
	onAutoSave: () => void;
}

export function EditHeader({
	currentUser,
	pageSlug,
	initialIsPublished,
	fetcher,
	hasUnsavedChanges,
	setHasUnsavedChanges,
	onAutoSave,
}: EditHeaderProps) {
	const isSubmitting = fetcher.state === "submitting";
	const [isPublished, setIsPublished] = useState(initialIsPublished);

	const handlePublishChange = (newPublishState: boolean) => {
		const formData = new FormData();
		const titleInput = document.querySelector<HTMLTextAreaElement>(
			'[data-testid="title-input"]',
		);
		const editorContent =
			document.querySelector<HTMLDivElement>(".ProseMirror");

		formData.set("title", titleInput?.value || "");
		formData.set("pageContent", editorContent?.innerHTML || "");
		formData.set("isPublished", newPublishState ? "true" : "false");

		fetcher.submit(formData, { method: "post" });
		setIsPublished(newPublishState);
	};

	useEffect(() => {
		if (fetcher.state === "loading") {
			setHasUnsavedChanges(false);
		}
	}, [fetcher.state, setHasUnsavedChanges]);

	const renderButtonIcon = () => {
		if (hasUnsavedChanges) {
			return <Loader2 className="w-4 h-4 animate-spin" />;
		}
		return <Check className="w-4 h-4" data-testid="save-button-check" />;
	};

	return (
		<header className="z-10  w-full ">
			<div className="max-w-7xl mx-auto py-2.5 md:py-4 px-4 md:px-6 lg:px-8">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link to="/home">
							<img
								src="/logo.svg"
								alt="Evame"
								className="h-8 w-auto dark:invert"
								aria-label="Evame Logo"
							/>
						</Link>
						<Button
							type="submit"
							variant="ghost"
							size="sm"
							className="rounded-full hover:bg-secondary/80"
							disabled={isSubmitting || !hasUnsavedChanges}
							data-testid="save-button"
						>
							{renderButtonIcon()}
						</Button>
						<input
							type="hidden"
							name="isPublished"
							value={isPublished ? "true" : "false"}
						/>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-3">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant={isPublished ? "default" : "secondary"}
										size="sm"
										className="rounded-full flex items-center gap-2 px-4 py-2 transition-colors duration-400"
										disabled={isSubmitting}
									>
										{isPublished ? (
											<Globe className="w-4 h-4" />
										) : (
											<Lock className="w-4 h-4" />
										)}
										<span>{isPublished ? "Public" : "Private"}</span>
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-32 rounded-xl p-1" align="end">
									<div className="space-y-1 p-1">
										<button
											type="button"
											className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors duration-200 hover:bg-secondary/80 disabled:opacity-50 disabled:pointer-events-none"
											onClick={() => handlePublishChange(true)}
											disabled={isPublished}
										>
											<Globe className="w-4 h-4" />
											<span>Public</span>
										</button>
										<button
											type="button"
											className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors duration-200 hover:bg-secondary/80 disabled:opacity-50 disabled:pointer-events-none"
											onClick={() => handlePublishChange(false)}
											disabled={!isPublished}
										>
											<Lock className="w-4 h-4" />
											<span>Private</span>
										</button>
									</div>
								</PopoverContent>
							</Popover>
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger>
								<img
									src={currentUser.icon}
									alt={currentUser.displayName}
									className="w-6 h-6 rounded-full"
								/>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="m-2 p-0 rounded-xl min-w-40">
								<DropdownMenuItem asChild>
									<Link
										to={`/${currentUser.userName}`}
										className="w-full rounded-none px-4 py-3 cursor-pointer hover:bg-accent hover:text-accent-foreground"
									>
										<div className="flex flex-col items-start">
											{currentUser.displayName}
											<span className="text-xs text-gray-500">
												@{currentUser.userName}
											</span>
										</div>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator className="my-0" />
								<DropdownMenuItem asChild>
									<Link
										to={`/${currentUser.userName}/settings`}
										className="w-full rounded-none flex items-center gap-2 justify-start text-left px-4 py-3 cursor-pointer hover:bg-accent hover:text-accent-foreground"
									>
										<SettingsIcon className="w-4 h-4" />
										Settings
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
											className="w-full gap-2 flex cursor-pointer items-center px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground text-red-500"
										>
											<LogOutIcon className="w-4 h-4" />
											Log out
										</button>
									</Form>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>
		</header>
	);
}

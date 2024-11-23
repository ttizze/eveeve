import type { FieldMetadata } from "@conform-to/react";
import type { Tag } from "@prisma/client";
import type { FetcherWithComponents } from "@remix-run/react";
import {
	ArrowDownToLine,
	ArrowLeft,
	ArrowUpFromLine,
	Check,
	Globe,
	Hash,
	Loader2,
	Lock,
	LogOutIcon,
	Search,
	SettingsIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { MultiValue } from "react-select";
import CreatableSelect from "react-select/creatable";
import type { z } from "zod";
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
import { Form } from "@remix-run/react";
import type { SanitizedUser } from "~/types";
import type { editPageSchema } from "../_edit";

interface EditHeaderProps {
	currentUser: SanitizedUser;
	pageSlug: string | undefined;
	initialIsPublished: boolean | undefined;
	fetcher: FetcherWithComponents<unknown>;
	hasUnsavedChanges: boolean;
	setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
	tagsMeta: FieldMetadata<z.infer<typeof editPageSchema>["tags"]>;
	initialTags: Tag[];
	allTags: Tag[];
}

export function EditHeader({
	currentUser,
	pageSlug,
	initialIsPublished,
	fetcher,
	hasUnsavedChanges,
	setHasUnsavedChanges,
	tagsMeta,
	initialTags,
	allTags,
}: EditHeaderProps) {
	const isSubmitting = fetcher.state === "submitting";
	const [isPublished, setIsPublished] = useState(initialIsPublished);
	const [selectedTags, setSelectedTags] = useState<
		MultiValue<{ value: string; label: string }>
	>(initialTags.map((tag) => ({ value: tag.name, label: tag.name })));

	const handlePublishToggle = (newPublishState: boolean) => {
		setIsPublished(newPublishState);
		setHasUnsavedChanges(true);
	};

	useEffect(() => {
		if (fetcher.state === "loading") {
			setHasUnsavedChanges(false);
		}
	}, [fetcher.state, setHasUnsavedChanges]);

	const renderButtonIcon = () => {
		if (hasUnsavedChanges) {
			return <Loader2 className="w-6 h-6 animate-spin" />;
		}
		return <Check className="w-6 h-6" data-testid="save-button-check" />;
	};

	return (
		<header className="z-10">
			<div className="max-w-7xl mx-auto py-2 md:py-4 px-2 md:px-6 lg:px-8">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link to="/home" className="text-2xl font-bold">
							Evame
						</Link>
						<Button
							type="submit"
							variant="default"
							size="sm"
							className="rounded-full"
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
						{selectedTags.map((tag, index) => (
							<input
								key={tag.value}
								type="hidden"
								name={`${tagsMeta.name}[${index}]`}
								value={tag.value}
							/>
						))}
					</div>
					<div className="flex items-center gap-3">
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="ghost"
									className="text-gray-500"
									data-testid="tags-button"
								>
									<Hash className="w-5 h-5 mr-2 text-gray-500" />
									{selectedTags.length}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-80">
								<CreatableSelect
									placeholder="tags"
									isMulti
									name={tagsMeta.name}
									options={allTags.map((tag) => ({
										value: tag.name,
										label: tag.name,
									}))}
									value={selectedTags}
									onChange={(value) => {
										setHasUnsavedChanges(true);
										setSelectedTags(
											value as MultiValue<{ value: string; label: string }>,
										);
									}}
									className="bg-transparent text-gray-900 text-sm w-full p-2 focus:outline-none"
									data-testid="tags-select"
								/>
								<p className="text-xs text-gray-500">max 5 tags</p>
								{tagsMeta.allErrors && (
									<div>
										{Object.entries(tagsMeta.allErrors).map(([key, errors]) => (
											<div key={key}>
												{errors.map((error) => (
													<p key={key} className="text-sm text-red-500">
														{error}
													</p>
												))}
											</div>
										))}
									</div>
								)}
							</PopoverContent>
						</Popover>
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="ml-auto"
									type="button"
									data-testid="change-publish-button"
								>
									{isPublished ? (
										<Globe className="w-5 h-5 mr-2" />
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
									<Globe className="mr-2 h-4 w-4" data-testid="public-button" />
									<span>Set to Public</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
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

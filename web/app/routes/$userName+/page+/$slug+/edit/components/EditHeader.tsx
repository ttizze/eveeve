import type { FieldMetadata } from "@conform-to/react";
import type { Tag } from "@prisma/client";
import type { FetcherWithComponents } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { Form } from "@remix-run/react";
import {
	Check,
	Globe,
	Loader2,
	Lock,
	LogOutIcon,
	Settings2,
	SettingsIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { MultiValue } from "react-select";
import CreatableSelect from "react-select/creatable";
import type { z } from "zod";
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
import { Switch } from "~/components/ui/switch";
import type { SanitizedUser } from "~/types";
import type { editPageSchema } from "../_edit";
import { ModeToggle } from "~/components/ModeToggle";
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
	onAutoSave: () => void;
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
	onAutoSave,
}: EditHeaderProps) {
	const isSubmitting = fetcher.state === "submitting";
	const [isPublished, setIsPublished] = useState(initialIsPublished);
	const [selectedTags, setSelectedTags] = useState<
		MultiValue<{ value: string; label: string }>
	>(initialTags.map((tag) => ({ value: tag.name, label: tag.name })));

	const handlePublishChange = (checked: boolean) => {
		const formData = new FormData();
		const titleInput = document.querySelector<HTMLTextAreaElement>(
			'[data-testid="title-input"]',
		);
		const editorContent =
			document.querySelector<HTMLDivElement>(".ProseMirror");

		formData.set("title", titleInput?.value || "");
		formData.set("pageContent", editorContent?.innerHTML || "");
		formData.set("isPublished", checked ? "true" : "false");
		selectedTags.forEach((tag, index) => {
			formData.set(`${tagsMeta.name}[${index}]`, tag.value);
		});

		fetcher.submit(formData, { method: "post" });
		setIsPublished(checked);
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
		<header className="z-10">
			<div className="max-w-7xl mx-auto py-2 md:py-4 px-2 md:px-6 lg:px-8">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link to="/home" className="text-2xl font-bold">
							Evame
						</Link>
						<Button
							type="submit"
							variant="ghost"
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
						<div className="flex items-center gap-2">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="rounded-full"
										disabled={isSubmitting}
									>
										<Settings2 className="w-4 h-4" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-80">
									<div className="space-y-4">
										<div>
											<h3 className="text-sm font-medium mb-3">Tags</h3>
											<CreatableSelect
												placeholder="Add tags..."
												isMulti
												name={tagsMeta.name}
												options={allTags.map((tag) => ({
													value: tag.name,
													label: tag.name,
												}))}
												value={selectedTags}
												onChange={(value) => {
													const formData = new FormData();
													const titleInput =
														document.querySelector<HTMLTextAreaElement>(
															'[data-testid="title-input"]',
														);
													const editorContent =
														document.querySelector<HTMLDivElement>(
															".ProseMirror",
														);

													formData.set("title", titleInput?.value || "");
													formData.set(
														"pageContent",
														editorContent?.innerHTML || "",
													);
													formData.set(
														"isPublished",
														isPublished ? "true" : "false",
													);
													(
														value as MultiValue<{
															value: string;
															label: string;
														}>
													).forEach((tag, index) => {
														formData.set(
															`${tagsMeta.name}[${index}]`,
															tag.value,
														);
													});

													setSelectedTags(
														value as MultiValue<{
															value: string;
															label: string;
														}>,
													);
													fetcher.submit(formData, { method: "post" });
												}}
												className="bg-transparent text-gray-900 text-sm w-full"
												data-testid="tags-select"
											/>
											<p className="text-xs text-gray-500 mt-2">max 5 tags</p>
											{tagsMeta.allErrors && (
												<div className="mt-2">
													{Object.entries(tagsMeta.allErrors).map(
														([key, errors]) => (
															<div key={key}>
																{errors.map((error) => (
																	<p
																		key={error}
																		className="text-sm text-red-500"
																	>
																		{error}
																	</p>
																))}
															</div>
														),
													)}
												</div>
											)}
										</div>
									</div>
								</PopoverContent>
							</Popover>
							<div className="flex items-center gap-2 bg-secondary/50 rounded-full px-3 py-1.5">
								{isPublished ? (
									<Globe className="w-4 h-4" />
								) : (
									<Lock className="w-4 h-4" />
								)}
								<Switch
									checked={isPublished}
									onCheckedChange={handlePublishChange}
									disabled={isSubmitting}
									data-testid="publish-switch"
								/>
							</div>
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

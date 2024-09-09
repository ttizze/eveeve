import {
	type FieldMetadata,
	type FormId,
	useFormMetadata,
} from "@conform-to/react";
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
import type { z } from "zod";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { SanitizedUser } from "~/types";
import type { editPageSchema } from "../_edit";

interface EditHeaderProps {
	currentUser: SanitizedUser | null;
	pageSlug: string | undefined;
	initialIsPublished: boolean | undefined;
	fetcher: FetcherWithComponents<unknown>;
	hasUnsavedChanges: boolean;
	setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
	tagsMeta: FieldMetadata<z.infer<typeof editPageSchema>["tags"]>;
	formId: FormId<z.infer<typeof editPageSchema>>;
}

export function EditHeader({
	currentUser,
	pageSlug,
	initialIsPublished,
	fetcher,
	hasUnsavedChanges,
	setHasUnsavedChanges,
	tagsMeta,
	formId,
}: EditHeaderProps) {
	const form = useFormMetadata(formId);
	const tags = tagsMeta.getFieldList();
	const isSubmitting = fetcher.state === "submitting";
	const [isPublished, setIsPublished] = useState(initialIsPublished);

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
		if (isSubmitting) {
			return <Loader2 className="w-6 h-6 animate-spin" />;
		}
		if (!hasUnsavedChanges) {
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
						<ArrowLeft className="w-6 h-6 opacity-50" />
					</Link>
				</div>
				<div className="justify-self-center">
					<Button
						type="submit"
						variant="default"
						className="rounded-full"
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
				<div className="justify-self-end flex items-center">
					{/* <Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" className="ml-2 px-2">
								<Hash className="w-4 h-4 mr-1" />
								<span className="text-gray-500 text-sm">{tags.length}</span>
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-80 p-4">
							<div className="space-y-4 flex flex-col justify-center">
								<div className="space-y-2">
									{tags.map((tag, index) => {
										const tagFields = tag.getFieldset();
										return (
											<div key={tag.key} className="flex items-center ">
												<Hash className="w-5 h-5 mr-2 text-gray-500" />
												<div className="bg-gray-300  rounded-full flex items-center">
													<input
														{...getInputProps(tagFields.name, { type: "text" })}
														onChange={() => setHasUnsavedChanges(true)}
														className="bg-transparent text-gray-900 text-sm  w-full p-2 focus:outline-none"
													/>
													<Button
														variant="ghost"
														size="icon"
														{...form.remove.getButtonProps({
															name: tagsMeta.name,
															index,
														})}
														onClick={() => setHasUnsavedChanges(true)}
														className="rounded-full text-gray-500"
													>
														×
													</Button>
												</div>
											</div>
										);
									})}
								</div>
								<Button
									variant="default"
									size="lg"
									{...form.insert.getButtonProps({ name: tagsMeta.name })}
									onClick={() => setHasUnsavedChanges(true)}
									className="text-center rounded-full"
								>
									<Plus className="w-5 h-5" />
								</Button>
							</div>
						</PopoverContent>
					</Popover> */}
					<div>
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
			</div>
		</header>
	);
}

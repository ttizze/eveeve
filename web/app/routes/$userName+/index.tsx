import type { LoaderFunctionArgs } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import Linkify from "linkify-react";
import { Lock, MoreVertical, Settings } from "lucide-react";
import { BookOpen, Trash } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import i18nServer from "~/i18n.server";
import { authenticator } from "~/utils/auth.server";
import {
	archivePage,
	togglePagePublicStatus,
} from "./functions/mutations.server";
import {
	fetchPageById,
	fetchSanitizedUserWithPages,
} from "./functions/queries.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	if (!data) {
		return [{ title: "Profile" }];
	}
	return [{ title: data.sanitizedUserWithPages.displayName }];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
	const locale = await i18nServer.getLocale(request);
	const { userName } = params;
	if (!userName) throw new Error("Username is required");
	const currentUser = await authenticator.isAuthenticated(request);
	const isOwner = currentUser?.userName === userName;

	const sanitizedUserWithPages = await fetchSanitizedUserWithPages(
		userName,
		isOwner,
	);
	if (!sanitizedUserWithPages) throw new Response("Not Found", { status: 404 });
	const sanitizedUserWithPagesLocalized = {
		...sanitizedUserWithPages,
		pages: sanitizedUserWithPages.pages.map((page) => ({
			...page,
			createdAt: new Date(page.createdAt).toLocaleDateString(locale),
		})),
	};
	return { sanitizedUserWithPages: sanitizedUserWithPagesLocalized, isOwner };
}

export async function action({ request }: ActionFunctionArgs) {
	const currentUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});
	const formData = await request.formData();
	const intent = formData.get("intent");
	const pageId = formData.get("pageId");

	if (!pageId) {
		return { error: "Page ID is required" };
	}
	const page = await fetchPageById(Number(pageId));
	if (!page) {
		return { error: "Page not found" };
	}
	if (page.userId !== currentUser.id) {
		return { error: "Unauthorized" };
	}
	switch (intent) {
		case "togglePublish":
			return await togglePagePublicStatus(Number(pageId));
		case "archive":
			return await archivePage(Number(pageId));
		default:
			return { error: "Invalid action" };
	}
}

export default function UserPage() {
	const navigate = useNavigate();
	const { sanitizedUserWithPages, isOwner } = useLoaderData<typeof loader>();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [pageToDelete, setPageToDelete] = useState<number | null>(null);

	const fetcher = useFetcher();

	const togglePagePublicStatus = (pageId: number) => {
		fetcher.submit(
			{ intent: "togglePublish", pageId: pageId },
			{ method: "post" },
		);
	};

	const handleArchive = (pageId: number) => {
		setPageToDelete(pageId);
		setDialogOpen(true);
	};
	const confirmArchive = () => {
		if (pageToDelete) {
			fetcher.submit(
				{ intent: "archive", pageId: pageToDelete },
				{ method: "post" },
			);
		}
		setDialogOpen(false);
	};
	return (
		<div className="">
			<div className="mb-6 rounded-3xl w-full overflow-hidden ">
				<div className="grid grid-cols-4 gap-4 p-4">
					<Link to={`${sanitizedUserWithPages.icon}`}>
						<div className="col-span-1 flex  justify-start">
							<div className="aspect-square w-40  md:w-32 lg:w-40 overflow-hidden rounded-full">
								{sanitizedUserWithPages.icon ? (
									<img
										src={sanitizedUserWithPages.icon}
										alt={sanitizedUserWithPages.displayName}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full bg-gray-200 flex items-center justify-center">
										<span className="text-2xl font-bold text-gray-500">
											{sanitizedUserWithPages.displayName
												.charAt(0)
												.toUpperCase()}
										</span>
									</div>
								)}
							</div>
						</div>
					</Link>
					<div className="col-span-3">
						<CardHeader className="p-0">
							<CardTitle className="text-2xl font-bold flex justify-between items-center">
								<div>{sanitizedUserWithPages.displayName}</div>
								{isOwner && (
									<Link to={`/${sanitizedUserWithPages.userName}/edit`}>
										<Button variant="ghost">
											<Settings className="w-6 h-6" />
										</Button>
									</Link>
								)}
							</CardTitle>
						</CardHeader>
						<CardContent className="break-all overflow-wrap-anywhere mt-2 p-0">
							<Linkify options={{ className: "underline" }}>
								{sanitizedUserWithPages.profile}
							</Linkify>
						</CardContent>
					</div>
				</div>
			</div>
			<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				{sanitizedUserWithPages.pages.map((page) => (
					<Card
						key={page.id}
						className="h-full relative  w-full overflow-hidden"
					>
						{isOwner && (
							<DropdownMenu modal={false}>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="h-8 w-8 p-0 absolute top-2 right-2"
										aria-label="More options"
									>
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										onSelect={() =>
											navigate(
												`/${sanitizedUserWithPages.userName}/page/${page.slug}/edit`,
											)
										}
									>
										Edit
									</DropdownMenuItem>
									<DropdownMenuItem
										onSelect={() => togglePagePublicStatus(page.id)}
									>
										{page.isPublished ? "Make Private" : "Make Public"}
									</DropdownMenuItem>
									<DropdownMenuItem onSelect={() => handleArchive(page.id)}>
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
						<Link
							to={`/${sanitizedUserWithPages.userName}/page/${page.slug}`}
							key={page.id}
							className="h-full"
						>
							<CardHeader>
								<CardTitle className="flex items-center pr-3 break-all overflow-wrap-anywhere">
									{page.isPublished ? "" : <Lock className="h-4 w-4 mr-2" />}
									{page.title}
								</CardTitle>
								<CardDescription>{page.createdAt}</CardDescription>
							</CardHeader>
						</Link>
					</Card>
				))}
			</div>

			{sanitizedUserWithPages.pages.length === 0 && (
				<p className="text-center text-gray-500 mt-10">
					{isOwner ? "You haven't created any pages yet." : "No pages yet."}
				</p>
			)}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center">
							<Trash className="w-4 h-4 mr-2" />
							<BookOpen className="w-4 h-4 mr-2" />
						</DialogTitle>
						<DialogDescription>
							This action cannot be undone. Are you sure you want to delete this
							page?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDialogOpen(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={confirmArchive}>
							<Trash className="w-4 h-4 mr-2" />
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

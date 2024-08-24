import type { LoaderFunctionArgs } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { useNavigate } from "@remix-run/react";
import Linkify from "linkify-react";
import { Lock, MoreVertical, Settings } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { authenticator } from "~/utils/auth.server";
import {
	archivePage,
	togglePagePublicStatus,
} from "./functions/mutations.server";
import { getSanitizedUserWithPages } from "./functions/queries.server";
import type { sanitizedUserWithPages } from "./types";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const { userName } = params;
	if (!userName) throw new Error("Username is required");
	const currentUser = await authenticator.isAuthenticated(request);
	const isOwner = currentUser?.userName === userName;

	const sanitizedUserWithPages = await getSanitizedUserWithPages(
		userName,
		isOwner,
	);
	if (!sanitizedUserWithPages) throw new Response("Not Found", { status: 404 });

	return { sanitizedUserWithPages, isOwner };
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const intent = formData.get("intent");
	const pageId = formData.get("pageId");

	if (!pageId) {
		return { error: "Page ID is required" };
	}

	switch (intent) {
		case "togglePublish":
			return await togglePagePublicStatus(Number(pageId));
		case "archive":
			return await archivePage(Number(pageId));
		default:
			return { error: "Invalid action" };
	}
};

export default function UserProfile() {
	const navigate = useNavigate();
	const { sanitizedUserWithPages, isOwner } = useLoaderData<{
		sanitizedUserWithPages: sanitizedUserWithPages;
		isOwner: boolean;
	}>();

	const fetcher = useFetcher();

	const togglePagePublicStatus = (pageId: number) => {
		fetcher.submit(
			{ intent: "togglePublish", pageId: pageId },
			{ method: "post" },
		);
	};

	const handleArchive = (pageId: number) => {
		if (
			confirm(
				"Are you sure you want to delete this page? This action cannot be undone.",
			)
		) {
			fetcher.submit({ intent: "archive", pageId: pageId }, { method: "post" });
		}
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
								<CardTitle className="line-clamp-2 flex items-center">
									{page.isPublished ? "" : <Lock className="h-4 w-4 mr-2" />}
									{page.title}
								</CardTitle>
								<CardDescription>
									{new Date(page.createdAt).toLocaleDateString()}
								</CardDescription>
							</CardHeader>
							<CardContent className="flex-grow overflow-hidden px-4">
								<p className="text-sm text-gray-600 line-clamp-4 break-all overflow-wrap-anywhere hyphens-auto">
									{page.content}
								</p>
							</CardContent>
						</Link>
					</Card>
				))}
			</div>

			{sanitizedUserWithPages.pages.length === 0 && (
				<p className="text-center text-gray-500 mt-10">
					{isOwner ? "You haven't created any pages yet." : "No pages yet."}
				</p>
			)}
		</div>
	);
}

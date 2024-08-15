import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Link } from "@remix-run/react";
import Linkify from "linkify-react";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { authenticator } from "~/utils/auth.server";
import { getSanitizedUserWithPages } from "./functions/queries.server";
import type { sanitizedUserWithPages } from "./types";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const { userName } = params;
	if (!userName) throw new Error("Username is required");

	const sanitizedUserWithPages = await getSanitizedUserWithPages(userName);
	if (!sanitizedUserWithPages) throw new Response("Not Found", { status: 404 });

	const currentUser = await authenticator.isAuthenticated(request);

	const isOwnProfile =
		currentUser?.userName === sanitizedUserWithPages.userName;

	return { sanitizedUserWithPages, isOwnProfile };
};

export default function UserProfile() {
	const stripHtmlTags = (html: string) => {
		return html.replace(/<[^>]*>/g, "");
	};

	const { sanitizedUserWithPages, isOwnProfile } = useLoaderData<{
		sanitizedUserWithPages: sanitizedUserWithPages;
		isOwnProfile: boolean;
	}>();

	return (
		<div className="container mx-auto mt-10">
			<Card className="h-full mb-6">
				<CardHeader>
					<CardTitle className="text-3xl font-bold flex justify-between items-center">
						{sanitizedUserWithPages.displayName}
						{isOwnProfile && (
							<Link to={`/${sanitizedUserWithPages.userName}/edit`}>
								<Button variant="outline">Edit</Button>
							</Link>
						)}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Linkify options={{ className: "underline" }}>
						{sanitizedUserWithPages.profile}
					</Linkify>
				</CardContent>
			</Card>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{sanitizedUserWithPages.pages.map((page) => (
					<Link
						to={`/${sanitizedUserWithPages.userName}/page/${page.slug}`}
						key={page.id}
						className="h-full"
					>
						<Card className="C">
							<CardHeader>
								<CardTitle className="line-clamp-2">{page.title}</CardTitle>
								<CardDescription>
									{new Date(page.createdAt).toLocaleDateString()}
								</CardDescription>
							</CardHeader>
							<CardContent className="flex-grow">
								<p className="text-sm text-gray-600 line-clamp-4">
									{stripHtmlTags(page.content)}
								</p>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>

			{sanitizedUserWithPages.pages.length === 0 && (
				<p className="text-center text-gray-500 mt-10">
					{isOwnProfile
						? "You haven't created any pages yet."
						: "No pages yet."}
				</p>
			)}
		</div>
	);
}

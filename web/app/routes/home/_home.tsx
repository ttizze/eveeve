import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { LikeButton } from "~/routes/resources+/like-button";
import { authenticator } from "~/utils/auth.server";
import { fetchLatestPublicPages } from "./functions/queries.server";

export const meta: MetaFunction = () => {
	return [{ title: "Home - Latest Pages" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
	const currentUser = await authenticator.isAuthenticated(request);
	const latestPages = await fetchLatestPublicPages(10, currentUser?.id);
	return { latestPages, currentUser };
}

export default function Home() {
	const { latestPages, currentUser } = useLoaderData<typeof loader>();

	return (
		<div className="container mx-auto px-4">
			<h1 className="text-3xl font-bold mb-6">Latest Pages</h1>
			<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				{latestPages.map((page) => (
					<Card
						key={page.id}
						className="h-full relative w-full overflow-hidden"
					>
						<CardHeader>
							<Link
								to={`/${page.user.userName}/page/${page.slug}`}
								className="block"
							>
								<CardTitle className="flex items-center pr-3 break-all overflow-wrap-anywhere">
									{page.title}
								</CardTitle>
								<CardDescription>
									{new Date(page.createdAt).toLocaleDateString()}
								</CardDescription>
							</Link>
						</CardHeader>
						<CardContent>
							<div className="flex justify-between items-center">
								<Link
									to={`/${page.user.userName}`}
									className="flex items-center"
								>
									<div className="w-8 h-8 rounded-full overflow-hidden mr-2">
										{page.user.icon ? (
											<img
												src={page.user.icon}
												alt={page.user.displayName}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="w-full h-full bg-gray-200 flex items-center justify-center">
												<span className="text-sm font-bold text-gray-500">
													{page.user.displayName.charAt(0).toUpperCase()}
												</span>
											</div>
										)}
									</div>
									<span className="text-sm text-gray-600">
										{page.user.displayName}
									</span>
								</Link>
								<LikeButton
									liked={page.likePages.length > 0}
									likeCount={page._count.likePages}
									slug={page.slug}
								/>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

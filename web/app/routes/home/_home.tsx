import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import { Link, useLoaderData, useSearchParams } from "react-router";
import type { MetaFunction } from "react-router";
import { CalendarPlus } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "~/components/ui/pagination";
import i18nServer from "~/i18n.server";
import { LikeButton } from "~/routes/resources+/like-button";
import { authenticator } from "~/utils/auth.server";
import { fetchPaginatedPublicPages } from "./functions/queries.server";

export const meta: MetaFunction = () => {
	return [{ title: "Home - Latest Pages" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
	const locale = await i18nServer.getLocale(request);
	const url = new URL(request.url);
	const page = Number(url.searchParams.get("page") || "1");
	const currentUser = await authenticator.isAuthenticated(request);
	const { pages, totalPages, currentPage } = await fetchPaginatedPublicPages(
		page,
		9,
		currentUser?.id,
	);
	const pagesLocale = pages.map((page) => {
		return {
			...page,
			createdAt: new Date(page.createdAt).toLocaleDateString(locale),
		};
	});

	return data({ pages: pagesLocale, totalPages, currentPage, currentUser });
}

export default function Home() {
	const { pages, totalPages, currentPage } = useLoaderData<typeof loader>();
	const [searchParams, setSearchParams] = useSearchParams();

	const handlePageChange = (newPage: number) => {
		setSearchParams({ page: newPage.toString() });
	};

	return (
		<div className="container mx-auto px-4">
			<h1 className="text-xl font-bold mb-6 flex items-center gap-2">
				<CalendarPlus />
				New
			</h1>
			<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				{pages.map((page) => (
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
								<CardDescription>{page.createdAt}</CardDescription>
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
									showCount
								/>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
			<div className="mt-8 flex justify-center">
				<Pagination>
					<PaginationContent>
						{currentPage > 1 && (
							<PaginationItem>
								<PaginationPrevious
									onClick={() => handlePageChange(currentPage - 1)}
								/>
							</PaginationItem>
						)}
						{Array.from({ length: totalPages }, (_, i) => i + 1).map(
							(pageNum) => (
								<PaginationItem key={pageNum}>
									<PaginationLink
										onClick={() => handlePageChange(pageNum)}
										isActive={pageNum === currentPage}
									>
										{pageNum}
									</PaginationLink>
								</PaginationItem>
							),
						)}
						{currentPage < totalPages && (
							<PaginationItem>
								<PaginationNext
									onClick={() => handlePageChange(currentPage + 1)}
								/>
							</PaginationItem>
						)}
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	);
}

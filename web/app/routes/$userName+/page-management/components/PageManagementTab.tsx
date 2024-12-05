import { useSearchParams } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "~/components/ui/pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { DeletePageDialog } from "../../components/DeletePageDialog";
import type { PageWithTitle } from "../types";

interface PageManagementTabProps {
	pagesWithTitle: PageWithTitle[];
	totalPages: number;
	currentPage: number;
}

export function PageManagementTab({
	pagesWithTitle,
	totalPages,
	currentPage,
}: PageManagementTabProps) {
	const [selectedPages, setSelectedPages] = useState<number[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [searchParams, setSearchParams] = useSearchParams();
	const [dialogOpen, setDialogOpen] = useState(false);
	const fetcher = useFetcher();

	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchTerm !== searchParams.get("search")) {
				setSearchParams({ page: "1", search: searchTerm });
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [searchTerm, setSearchParams, searchParams]);

	const handlePageChange = (newPage: number) => {
		setSearchParams({
			page: newPage.toString(),
			...(searchTerm && { search: searchTerm }),
		});
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedPages(pagesWithTitle.map((pageWithTitle) => pageWithTitle.id));
		} else {
			setSelectedPages([]);
		}
	};

	const handleSelectPage = (pageId: number, checked: boolean) => {
		if (checked) {
			setSelectedPages((prev) => [...prev, pageId]);
		} else {
			setSelectedPages((prev) => prev.filter((id) => id !== pageId));
		}
	};

	const handleDelete = () => {
		fetcher.submit(
			{ intent: "archive", pageIds: selectedPages.join(",") },
			{ method: "post" },
		);
		setDialogOpen(false);
		setSelectedPages([]);
	};

	const getStatusBadge = (isPublished: boolean) => {
		if (isPublished) {
			return <Badge variant="default">Published</Badge>;
		}
		return <Badge variant="outline">Private</Badge>;
	};

	return (
		<div className="space-y-4">
			<div className="">
				<Input
					placeholder="Search pages..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full"
				/>
				<div className=" w-full py-2 flex justify-end gap-2">
					<Button
						variant="outline"
						onClick={() => setSelectedPages([])}
						disabled={selectedPages.length === 0}
					>
						Clear Selection ({selectedPages.length})
					</Button>
					<Button
						variant="destructive"
						onClick={() => setDialogOpen(true)}
						disabled={selectedPages.length === 0}
					>
						Delete Selected
					</Button>
				</div>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12">
								<Checkbox
									checked={selectedPages.length === pagesWithTitle.length}
									onCheckedChange={handleSelectAll}
								/>
							</TableHead>
							<TableHead>Title</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Last Modified</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{pagesWithTitle.map((pageWithTitle) => (
							<TableRow key={pageWithTitle.id}>
								<TableCell>
									<Checkbox
										checked={selectedPages.includes(pageWithTitle.id)}
										onCheckedChange={(checked) =>
											handleSelectPage(pageWithTitle.id, checked as boolean)
										}
									/>
								</TableCell>
								<TableCell className="font-medium">
									{pageWithTitle.title}
								</TableCell>
								<TableCell>
									{getStatusBadge(pageWithTitle.isPublished)}
								</TableCell>
								<TableCell>{pageWithTitle.updatedAt}</TableCell>
								<TableCell className="text-right">
									<Button variant="ghost" size="sm" asChild>
										<a href={`/${pageWithTitle.slug}/edit`}>Edit</a>
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<div className="flex justify-center mt-4">
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

			<DeletePageDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				onConfirm={handleDelete}
			/>
		</div>
	);
}

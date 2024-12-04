import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";

export function PageManagementTab() {
	const [selectedPages, setSelectedPages] = useState<string[]>([]);
	const [searchTerm, setSearchTerm] = useState("");

	// TODO: Replace with actual data from loader
	const pages = [
		{
			id: "1",
			title: "Sample Page 1",
			slug: "sample-page-1",
			lastModified: "2023-12-04",
		},
		{
			id: "2",
			title: "Sample Page 2",
			slug: "sample-page-2",
			lastModified: "2023-12-03",
		},
	];

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedPages(pages.map((page) => page.id));
		} else {
			setSelectedPages([]);
		}
	};

	const handleSelectPage = (pageId: string, checked: boolean) => {
		if (checked) {
			setSelectedPages([...selectedPages, pageId]);
		} else {
			setSelectedPages(selectedPages.filter((id) => id !== pageId));
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col space-y-4">
				<h2 className="text-2xl font-bold tracking-tight">Page Management</h2>
				<p className="text-muted-foreground">
					Manage your pages, perform bulk actions, and organize your content.
				</p>
			</div>

			<div className="flex justify-between items-center">
				<div className="flex gap-2">
					<Button
						variant="destructive"
						size="sm"
						disabled={selectedPages.length === 0}
					>
						Delete Selected
					</Button>
					<Button
						variant="secondary"
						size="sm"
						disabled={selectedPages.length === 0}
					>
						Translate Selected
					</Button>
				</div>
				<Input
					placeholder="Search pages..."
					className="max-w-xs"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</div>

			<div className="border rounded-md">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12">
								<Checkbox
									checked={selectedPages.length === pages.length}
									onCheckedChange={handleSelectAll}
								/>
							</TableHead>
							<TableHead>Title</TableHead>
							<TableHead>Slug</TableHead>
							<TableHead>Last Modified</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{pages.map((page) => (
							<TableRow key={page.id}>
								<TableCell>
									<Checkbox
										checked={selectedPages.includes(page.id)}
										onCheckedChange={(checked) =>
											handleSelectPage(page.id, checked as boolean)
										}
									/>
								</TableCell>
								<TableCell>{page.title}</TableCell>
								<TableCell>{page.slug}</TableCell>
								<TableCell>{page.lastModified}</TableCell>
								<TableCell className="text-right">
									<Button variant="ghost" size="sm">
										Edit
									</Button>
									<Button variant="ghost" size="sm">
										View
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

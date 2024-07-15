import type { Page } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";

interface LoaderData {
	pageList: Page[];
}

export function TranslatedList() {
	const { pageList } = useLoaderData<LoaderData>();
	return <div>TranslatedList</div>;
}

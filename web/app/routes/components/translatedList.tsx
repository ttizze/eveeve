import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { prisma } from "../../utils/prisma";
import type { Page } from "@prisma/client";

interface LoaderData {
	pageList: Page[];
}

export function TranslatedList() {
	const { pageList } = useLoaderData<LoaderData>();
	return <div>TranslatedList</div>;
}
// @ts-ignore
import { routes } from "virtual:remix/server-build";
import { generateSitemap } from "@nasa-gcn/remix-seo";
import type { SEOHandle } from "@nasa-gcn/remix-seo";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
	fetchAllPublishedPages,
	fetchAllUsersName,
} from "./functions/queries.server";
import { serverOnly$ } from "vite-env-only/macros"

export async function loader({ request }: LoaderFunctionArgs) {
	return generateSitemap(request, routes, {
		siteUrl: process.env.CLIENT_URL || "https://eveeeve.org",
		headers: {
			"Cache-Control": "public, max-age=3600",
		},
	});
}

export const handle: SEOHandle = {
	getSitemapEntries: serverOnly$(async () => {
		const [pages, users] = await Promise.all([
			fetchAllPublishedPages(),
			fetchAllUsersName(),
		]);

		const pageEntries = pages.map((page) => ({
			route: `/${page.user.userName}/page/${page.slug}`,
			lastmod: page.updatedAt.toISOString(),
		}));

		const userEntries = users.map((user) => ({
			route: `/${user.userName}`,
			lastmod: user.updatedAt.toISOString(),
		}));

		return [...pageEntries, ...userEntries];
	}),
};

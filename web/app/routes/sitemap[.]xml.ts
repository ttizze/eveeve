// @ts-ignore
import { routes } from "virtual:remix/server-build";
import { generateSitemap } from "@nasa-gcn/remix-seo";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
	return generateSitemap(request, routes, {
		siteUrl: process.env.CLIENT_URL || "https://eveeeve.org",
		headers: {
			"Cache-Control": "public, max-age=3600",
		},
	});
}

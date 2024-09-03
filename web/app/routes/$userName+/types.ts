import type { Page } from "@prisma/client";
import type { SanitizedUser } from "~/types";

export type PageListItem = Pick<
	Page,
	"id" | "title" | "slug" | "isPublished" | "createdAt"
>;
export type sanitizedUserWithPages = SanitizedUser & {
	pages: PageListItem[];
};

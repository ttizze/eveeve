import type { Page } from "@prisma/client";
import type { SanitizedUser } from "~/types";

export type sanitizedUserWithPages = SanitizedUser & {
	pages: Page[];
};

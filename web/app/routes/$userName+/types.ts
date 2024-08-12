import type { Page } from "@prisma/client";
import type { SafeUser } from "~/types";

export type UserWithPages = SafeUser & {
	pages: Page[];
};

import type { SafeUser } from "~/types";
import type { Page } from "@prisma/client";

export type UserWithPages = SafeUser & {
  pages: Page [];
};
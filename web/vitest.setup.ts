import { vi } from "vitest";

vi.mock("~/utils/prisma", () => ({
	// @ts-ignore
	prisma: vPrisma.client,
}));

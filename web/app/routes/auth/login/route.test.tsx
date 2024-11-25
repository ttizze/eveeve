import { createRemixStub } from "@remix-run/testing";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import "@testing-library/jest-dom";

import { prisma } from "~/utils/prisma";
import { resendSendEmail } from "~/utils/resend.server";
import LoginPage, { action, loader } from "./route";

// Mock email sending
vi.mock("~/utils/resend.server", () => ({
	resendSendEmail: vi.fn(),
}));

describe("Login Authentication", () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		// Clean up test users
		await prisma.user.deleteMany({
			where: {
				email: {
					endsWith: "@test.com",
				},
			},
		});
	});

	test("magic link authentication flow", async () => {
		const RemixStub = createRemixStub([
			{
				path: "/auth/login",
				Component: LoginPage,
				loader,
				action,
			},
		]);

		render(<RemixStub initialEntries={["/auth/login"]} />);

		// Submit magic link form
		const emailInput = screen.getByLabelText("Email");
		await userEvent.type(emailInput, "newuser@test.com");
		const submitButton = screen.getByRole("button", { name: "Send Email" });
		await userEvent.click(submitButton);

		// Verify email sending attempt
		expect(resendSendEmail).toHaveBeenCalledWith(
			"newuser@test.com",
			"Sign in to Evame",
			expect.stringContaining("Sign in to Evame"),
		);

		// Verify user creation
		const user = await prisma.user.findUnique({
			where: { email: "newuser@test.com" },
		});
		expect(user).not.toBeNull();
		expect(user?.provider).toBe("MagicLink");
	});

	// test("existing user magic link flow", async () => {
	//   // Create existing user first
	//   const existingUser = await prisma.user.create({
	//     data: {
	//       email: "existing@test.com",
	//       userName: "existing-user",
	//       displayName: "Existing User",
	//       provider: "MagicLink",
	//       icon: "http://localhost:3000/avatar.png"
	//     }
	//   });

	//   const RemixStub = createRemixStub([
	//     {
	//       path: "/auth/login",
	//       Component: LoginPage,
	//       loader,
	//       action,
	//     },
	//   ]);

	//   render(<RemixStub initialEntries={["/auth/login"]} />);

	//   // Submit magic link form for existing user
	//   const emailInput = screen.getByLabelText("Email");
	//   await userEvent.type(emailInput, "existing@test.com");
	//   const submitButton = screen.getByRole("button", { name: "Send Email" });
	//   await userEvent.click(submitButton);

	//   // Verify email sending attempt
	//   expect(resendSendEmail).toHaveBeenCalledWith(
	//     "existing@test.com",
	//     "Sign in to Evame",
	//     expect.stringContaining("Sign in to Evame")
	//   );

	//   // Verify user wasn't recreated
	//   const users = await prisma.user.findMany({
	//     where: { email: "existing@test.com" }
	//   });
	//   expect(users).toHaveLength(1);
	//   expect(users[0].id).toBe(existingUser.id);
	// });

	// /**
	//  * Note: Google OAuth flow should be tested in E2E tests
	//  * as it requires real browser interaction and credentials
	//  */
	// test("google auth button is properly configured", async () => {
	//   const RemixStub = createRemixStub([
	//     {
	//       path: "/auth/login",
	//       Component: LoginPage,
	//       loader,
	//       action,
	//     },
	//   ]);

	//   render(<RemixStub initialEntries={["/auth/login"]} />);

	//   // Verify Google auth form exists with correct configuration
	//   const googleForm = screen.getByRole("form");
	//   expect(googleForm).toHaveAttribute("action", "/auth/login");
	//   expect(googleForm).toHaveAttribute("method", "post");
	// });
});

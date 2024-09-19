import { createRemixStub } from "@remix-run/testing";
import { render, screen, waitFor } from "@testing-library/react";
import { expect, test } from "vitest";
import "@testing-library/jest-dom";
import { authenticator } from "~/utils/auth.server";
import { prisma } from "~/utils/prisma";
import UserProfile, { loader } from "./index";

vi.mock("~/utils/auth.server", () => ({
	authenticator: {
		isAuthenticated: vi.fn(),
	},
}));

test("loader returns correct data for authenticated owner", async () => {
	const user = await prisma.user.create({
		data: {
			userName: "testuser",
			displayName: "Test User",
			email: "testuser@example.com",
			icon: "https://example.com/icon.jpg",
			profile: "This is a test profile",
			pages: {
				create: [
					{
						title: "Public Page",
						slug: "public-page",
						isPublished: true,
						content: "This is a test content",
					},
					{
						title: "Private Page",
						slug: "private-page",
						isPublished: false,
						content: "This is a test content2",
					},
					{
						title: "Archived Page",
						slug: "archived-page",
						isArchived: true,
						content: "This is a test content3",
					},
				],
			},
		},
		include: { pages: true },
	});
	// @ts-ignore
	vi.mocked(authenticator.isAuthenticated).mockResolvedValue({
		id: user.id,
		userName: user.userName,
	});
	const RemixStub = createRemixStub([
		{
			path: "/:userName",
			Component: UserProfile,
			loader,
		},
	]);

	render(<RemixStub initialEntries={["/testuser"]} />);
	await waitFor(async () => {
		expect(await screen.findByText(user.displayName)).toBeInTheDocument();
		expect(await screen.findByText(user.profile)).toBeInTheDocument();
		expect(await screen.findByText("Public Page")).toBeInTheDocument();
		expect(await screen.findByText("Private Page")).toBeInTheDocument();
		expect(await screen.queryByText("Archived Page")).not.toBeInTheDocument();
	});
});

test("loader returns correct data for unauthenticated visitor", async () => {
	const user = {
		id: 1,
		userName: "testuser",
		displayName: "Test User",
		email: "testuser@example.com",
		icon: "https://example.com/icon.jpg",
		profile: "This is a test profile",
		pages: [
			{
				id: 1,
				title: "Public Page",
				slug: "public-page",
				isPublished: true,
				content: "This is a public content",
			},
			{
				id: 2,
				title: "Private Page",
				slug: "private-page",
				isPublished: false,
				content: "This is a private content",
			},
		],
	};

	vi.mocked(authenticator.isAuthenticated).mockResolvedValue(null);

	const RemixStub = createRemixStub([
		{
			path: "/:userName",
			Component: UserProfile,
			loader,
		},
	]);

	render(<RemixStub initialEntries={["/testuser"]} />);
	await waitFor(async () => {
		expect(await screen.findByText(user.displayName)).toBeInTheDocument();
		expect(await screen.findByText(user.profile)).toBeInTheDocument();
		expect(await screen.findByText("Public Page")).toBeInTheDocument();
		expect(await screen.queryByText("Private Page")).not.toBeInTheDocument();
	});
});
// test('action handles togglePublish correctly', async () => {
//   // Arrange: テストデータを作成
//   const user = await prisma.user.create({
//     data: {
//       userName: 'testuser',
//       displayName: 'Test User',
//       pages: {
//         create: [
//           { title: 'Test Page', slug: 'test-page', isPublished: true },
//         ],
//       },
//     },
//     include: { pages: true },
//   });

//   vi.mocked(authenticator.isAuthenticated).mockResolvedValue({ id: user.id, userName: 'testuser' });

//   const formData = new FormData();
//   formData.append('intent', 'togglePublish');
//   formData.append('pageId', user.pages[0].id.toString());

//   // Act
//   await action({
//     request: new Request('http://test.com', {
//       method: 'POST',
//       body: formData,
//     }),
//   } as any);

//   // Assert
//   const updatedPage = await prisma.page.findUnique({ where: { id: user.pages[0].id } });
//   expect(updatedPage?.isPublished).toBe(false);
// });

// test('UserProfile component renders correctly', async () => {
//   // Arrange: テストデータを作成
//   const user = await prisma.user.create({
//     data: {
//       userName: 'testuser',
//       displayName: 'Test User',
//       profile: 'This is a test profile',
//       pages: {
//         create: [
//           { title: 'Test Page', slug: 'test-page', isPublished: true },
//         ],
//       },
//     },
//     include: { pages: true },
//   });

//   const RemixStub = createRemixStub([
//     {
//       path: '/:userName',
//       Component: UserProfile,
//       loader: () => ({
//         sanitizedUserWithPages: {
//           ...user,
//           createdAt: user.createdAt.toISOString(),
//           pages: user.pages,
//         },
//         isOwner: true,
//         pageCreatedAt: new Date().toLocaleDateString(),
//       }),
//     },
//   ]);

//   // Act
//   render(<RemixStub initialEntries={['/testuser']} />);

//   // Assert
//   expect(await screen.findByText('Test User')).toBeInTheDocument();
//   expect(screen.getByText('This is a test profile')).toBeInTheDocument();
//   expect(screen.getByText('Test Page')).toBeInTheDocument();
// });

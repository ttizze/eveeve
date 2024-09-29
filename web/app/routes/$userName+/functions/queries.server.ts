import { prisma } from "~/utils/prisma";
import { sanitizeUser } from "~/utils/sanitizeUser";

export async function fetchSanitizedUserWithPages(
	userName: string,
	isOwnProfile: boolean,
) {
	const user = await prisma.user.findUnique({
		where: { userName },
		include: {
			pages: {
				include: {
					sourceTexts: {
						where: {
							number: 0,
						},
					},
				},
				where: {
					isArchived: false,
					...(isOwnProfile ? {} : { isPublished: true }),
				},
				orderBy: { createdAt: "desc" },
			},
		},
	});

	if (!user) return null;

	const pages = user.pages.map((page) => ({
		...page,
	}));
	return {
		...sanitizeUser(user),
		pages,
	};
}

export async function fetchPageById(pageId: number) {
	return prisma.page.findUnique({
		where: { id: pageId },
	});
}

import { processHtmlContent } from "~/routes/$userName+/page+/$slug+/edit/utils/processHtmlContent";
import { prisma } from "~/utils/prisma";

try {
	const pages = await prisma.page.findMany({
		select: {
			id: true,
			slug: true,
			content: true,
			userId: true,
			sourceLanguage: true,
			isPublished: true,
			sourceTexts: {
				select: {
					id: true,
					text: true,
					number: true,
				},
			},
		},
	});

	for (const page of pages) {
		try {
			const pageContent = page.content;
			const title = page.sourceTexts.find(
				(sourceText) => sourceText.number === 0,
			)?.text;

			if (!title) {
				console.log(`Skipping page ${page.id}: No title found`);
				continue;
			}

			await prisma.page.update({
				where: { id: page.id },
				data: {
					title: title,
				},
			});

			await processHtmlContent(
				title,
				pageContent,
				page.slug,
				page.userId,
				page.sourceLanguage,
				page.isPublished,
			);
		} catch (pageError) {
			console.error(`Error processing page ${page.id}:`, pageError);
		}
	}
} catch (error) {
	console.error("Database query failed:", error);
	process.exit(1);
}

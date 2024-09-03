export function stripHtmlTags(html: string): string {
	return html.replace(/<[^>]*>/g, "");
}

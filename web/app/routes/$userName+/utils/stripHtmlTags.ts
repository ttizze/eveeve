import DOMPurify from "dompurify";

export function stripHtmlTags(html: string) {
	return DOMPurify.sanitize(html, {
		ALLOWED_TAGS: [],
		ALLOWED_ATTR: [],
	}).trim();
}

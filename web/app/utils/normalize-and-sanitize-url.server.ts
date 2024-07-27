import normalizeUrl from "normalize-url";

export function normalizeAndSanitizeUrl(inputUrl: string): string {
	let decodedUrl: string;
	try {
		decodedUrl = decodeURIComponent(inputUrl);
	} catch {
		decodedUrl = inputUrl;
	}

	return normalizeUrl(decodedUrl, {
		stripHash: true,
		removeQueryParameters: true,
	});
}

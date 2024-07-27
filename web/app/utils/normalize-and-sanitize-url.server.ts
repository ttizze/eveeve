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

export function prepareUrlForSearch(inputUrl: string): string {
	let url = inputUrl;
	url = url.replace(/^https?:\/\//, "");
	url = url.replace(/^www\./, "");
	url = url.split(/[?#]/)[0];
	url = url.replace(/\/$/, "");
	return url.toLowerCase();
}

export function prepareUrlForSearchFromRawInput(inputUrl: string): string {
	const normalizedUrl = normalizeAndSanitizeUrl(inputUrl);
	return prepareUrlForSearch(normalizedUrl);
}

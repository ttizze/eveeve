
export function extractTranslations(
	text: string,
): { number: number; text: string }[] {
	try {
		const parsed = JSON.parse(text);
		if (Array.isArray(parsed)) {
			return parsed;
		}
	} catch (error) {
		console.warn("Failed to parse JSON, falling back to regex parsing", error);
	}

	const translations: { number: number; text: string }[] = [];
	const regex =
		/{\s*"number"\s*:\s*(\d+)\s*,\s*"text"\s*:\s*"((?:\\.|[^"\\])*)"\s*}/g;
	let match: RegExpExecArray | null;

	while (true) {
		match = regex.exec(text);
		if (match === null) break;

		translations.push({
			number: Number.parseInt(match[1], 10),
			text: match[2],
		});
	}

	return translations;
}
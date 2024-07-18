export async function fetchWithRetry(
	url: string,
	maxRetries = 3,
): Promise<string> {
	let lastError: Error | null = null;

	for (let retryCount = 0; retryCount < maxRetries; retryCount++) {
		try {
			const response = await fetch(url, {});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.text();
		} catch (error: unknown) {
			const typedError = error as Error;
			console.error(`Attempt ${retryCount + 1} failed: ${typedError}`);
			lastError = typedError;

			if (retryCount < maxRetries - 1) {
				await new Promise((resolve) =>
					setTimeout(resolve, 1000 * (retryCount + 1)),
				);
			}
		}
	}

	throw new Error(
		`Failed to fetch ${url} after ${maxRetries} attempts. Last error: ${lastError?.message}`,
	);
}

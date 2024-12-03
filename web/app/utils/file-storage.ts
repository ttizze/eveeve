import { PutObjectCommand, type S3Client } from "@aws-sdk/client-s3";

import type { FileStorage } from "@mjackson/file-storage";

export class R2FileStorage implements FileStorage {
	constructor(
		private client: S3Client,
		private bucket: string,
	) {}

	async has(key: string): Promise<boolean> {
		return false;
	}

	async set(key: string, file: File): Promise<void> {
		await this.client.send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: key,
				Body: file.stream(),
				ContentType: file.type,
				Metadata: {
					filename: file.name,
					lastModified: file.lastModified.toString(),
				},
			}),
		);
	}

	async get(key: string): Promise<File | null> {
		return null;
	}

	async remove(key: string): Promise<void> {
		return;
	}
}

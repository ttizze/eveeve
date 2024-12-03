import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { type FileUpload, parseFormData } from "@mjackson/form-data-parser";
import type { ActionFunctionArgs } from "react-router";
import { R2FileStorage } from "~/utils/file-storage";

const isProduction = process.env.NODE_ENV === "production";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = isProduction ? "eveeve" : "evame";

const s3Client = new S3Client(
	isProduction
		? {
				region: "us-east-1",
				endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
				credentials: {
					accessKeyId: R2_ACCESS_KEY_ID ?? "",
					secretAccessKey: R2_SECRET_ACCESS_KEY ?? "",
				},
			}
		: {
				region: "us-east-1",
				endpoint: "http://localhost:9000",
				credentials: {
					accessKeyId: "minioadmin",
					secretAccessKey: "minioadmin",
				},
				forcePathStyle: true,
			},
);

const fileStorage = new R2FileStorage(s3Client, R2_BUCKET_NAME);

export async function action({ request }: ActionFunctionArgs) {
	const uploadHandler = async (fileUpload: FileUpload) => {
		if (fileUpload.fieldName === "file") {
			const key = `uploads/${Date.now()}-${fileUpload.name}`;

			return await fileStorage.set(key, fileUpload);
		}
	};
	const formData = await parseFormData(request, uploadHandler, {
		maxFileSize: 1024 * 1024 * 3,
	});
	const file = formData.get("file") as File;
	if (!file) {
		return Response.json({ error: "file not found" }, { status: 400 });
	}

	const url = await uploadToR2(file);
	return Response.json({ url });
}

export async function uploadToR2(file: File): Promise<string> {
	const key = `uploads/${Date.now()}-${file.name}`;

	const arrayBuffer = await file.arrayBuffer();

	const command = new PutObjectCommand({
		Bucket: R2_BUCKET_NAME,
		Key: key,
		Body: Buffer.from(arrayBuffer),
		ContentType: file.type,
	});

	await s3Client.send(command);
	return isProduction
		? `https://images.eveeve.org/${key}`
		: `http://localhost:9000/${R2_BUCKET_NAME}/${key}`;
}

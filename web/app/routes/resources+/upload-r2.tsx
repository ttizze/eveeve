import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { type ActionFunction, json } from "@remix-run/node";
import {
	unstable_createMemoryUploadHandler,
	unstable_parseMultipartFormData,
} from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
	const uploadHandler = unstable_createMemoryUploadHandler({
		maxPartSize: 1024 * 1024 * 10,
	});
	const formData = await unstable_parseMultipartFormData(
		request,
		uploadHandler,
	);
	const file = formData.get("file") as File;
	if (!file) {
		return json({ error: "file not found" }, { status: 400 });
	}

	try {
		const url = await uploadToR2(file);
		return json({ url });
	} catch (error) {
		console.error("upload error:", error);
		return json(
			{ error: "upload error please try again later" },
			{ status: 500 },
		);
	}
};

const isProduction = process.env.NODE_ENV === "production";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = "eveeve";

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

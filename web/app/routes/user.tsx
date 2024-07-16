import { useForm } from "@conform-to/react";
import { getFormProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { getZodConstraint } from "@conform-to/zod";
import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { authenticator } from "../utils/auth.server";
import { prisma } from "../utils/prisma";

const geminiApiKeySchema = z.object({
	geminiApiKey: z.string().min(1, "API key is required"),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const safeUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/auth/login",
	});

	const dbUser = await prisma.user.findUnique({ where: { id: safeUser.id } });
	const hasGeminiApiKey = !!dbUser?.geminiApiKey;

	return json({ safeUser, hasGeminiApiKey });
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const safeUser = await authenticator.isAuthenticated(request, {
		failureRedirect: "/auth/login",
	});
	const formData = await request.formData();
	const submission = parseWithZod(formData, { schema: geminiApiKeySchema });

	if (submission.status !== "success") {
		return json({ result: submission.reply() });
	}
	try {
		await prisma.user.update({
			where: { id: safeUser.id },
			data: { geminiApiKey: submission.value.geminiApiKey },
		});
		return json({ result: submission.reply() });
	} catch (error) {
		return json({ result: submission.reply() });
	}
};

export default function UserPage() {
	const { safeUser, hasGeminiApiKey } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const [form, { geminiApiKey }] = useForm({
		id: "gemini-api-key-form",
		lastResult: actionData?.result,
		constraint: getZodConstraint(geminiApiKeySchema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: geminiApiKeySchema });
		},
	});

	return (
		<div className="max-w-md mx-auto mt-10">
			<h1 className="text-2xl font-bold mb-5">User Profile</h1>
			<p className="mb-5">Welcome, {safeUser.email}</p>

			<div className="mb-5">
				<h2 className="text-xl font-semibold mb-2">Gemini API Key</h2>
				{hasGeminiApiKey ? (
					<p className="text-green-600">API key is set</p>
				) : (
					<p className="text-yellow-600">No API key set</p>
				)}
			</div>

			<Form method="post" className="space-y-4" {...getFormProps(form)}>
				<div>
					<label
						htmlFor="geminiApiKey"
						className="block text-sm font-medium text-gray-700"
					>
						{hasGeminiApiKey ? "Update Gemini API Key" : "Set Gemini API Key"}
					</label>
					<input
						type="password"
						id="geminiApiKey"
						name="geminiApiKey"
						required
						className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
						defaultValue={hasGeminiApiKey ? "***" : ""}
					/>
				</div>
				<button
					type="submit"
					className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
				>
					Save API Key
				</button>
			</Form>
		</div>
	);
}

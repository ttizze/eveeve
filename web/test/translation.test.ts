import { createRemixStub } from "@remix-run/testing";
import { test, vi } from "vitest";
import { action } from "../app/routes/_index/libs/translation";

// モックの translateAndDisplayContent 関数
vi.mock("./translation", () => ({
	translateAndDisplayContent: vi
		.fn()
		.mockResolvedValue({ translatedContent: "Translated content" }),
}));

test("translation action with valid data", async () => {
	const remixStub = createRemixStub([
		{
			id: "root",
			path: "/",
			action: action,
		},
	]);

	const formData = new FormData();
	formData.append("title", "Test Title");
	formData.append("numberedContent", "Numbered content");
	formData.append(
		"numberedElements",
		JSON.stringify([{ number: 1, text: "Element 1" }]),
	);
	formData.append("url", "https://example.com");
});

test("translation action with invalid data", async () => {
	const remixStub = createRemixStub([
		{
			id: "root",
			path: "/",
			action: action,
		},
	]);

	const formData = new FormData();
	formData.append("title", "Test Title");
	// numberedContent is missing
	formData.append(
		"numberedElements",
		JSON.stringify([{ number: 1, text: "Element 1" }]),
	);
	formData.append("url", "https://example.com");
});

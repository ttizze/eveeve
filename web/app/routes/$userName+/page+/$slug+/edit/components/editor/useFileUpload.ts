import type { Editor as TiptapEditor } from "@tiptap/core";
import { EDITOR_MESSAGES, MAX_FILE_SIZE } from "./constants";

async function uploadImage(file: File): Promise<string> {
	const formData = new FormData();
	formData.append("file", file);

	try {
		const response = await fetch("/resources/upload-r2", {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			throw new Error(EDITOR_MESSAGES.UPLOAD_FAILED);
		}

		const data = await response.json();
		return data.url;
	} catch (error) {
		console.error("upload error:", error);
		throw error;
	}
}

export async function handleFileUpload(
	file: File,
	editor: TiptapEditor,
	pos?: number,
) {
	if (file.size > MAX_FILE_SIZE) {
		window.alert(EDITOR_MESSAGES.FILE_TOO_LARGE);
		return;
	}

	editor
		.chain()
		.insertContentAt(pos ?? editor.state.selection.anchor, {
			type: "image",
			attrs: {
				src: "https://via.placeholder.com/300x200?text=Uploading...",
				class: "transition-all duration-300 ease-in-out",
			},
		})
		.focus()
		.run();
	try {
		const url = await uploadImage(file);
		editor.commands.updateAttributes("image", {
			src: url,
			"data-temp-id": null,
			class: "transition-all duration-300 ease-in-out",
		});
	} catch (error) {
		window.alert(EDITOR_MESSAGES.UPLOAD_ERROR);
	}
}

import type { Editor as TiptapEditor } from "@tiptap/core";
import { UPLOAD_MESSAGES } from "../../../../../constants";
import { uploadImage } from "../../../../../utils/uploadImage";

export async function handleFileUpload(
	file: File,
	editor: TiptapEditor,
	pos?: number,
) {
	editor
		.chain()
		.insertContentAt(pos ?? editor.state.selection.anchor, {
			type: "image",
			attrs: {
				src: "https://via.placeholder.com/300x200?text=Uploading...",
			},
		})
		.focus()
		.run();
	try {
		const url = await uploadImage(file);
		editor.commands.updateAttributes("image", {
			src: url,
		});
		editor.commands.focus();
	} catch (error) {
		window.alert(UPLOAD_MESSAGES.UPLOAD_ERROR);
	}
}

import { useInputControl } from "@conform-to/react";
import { EditorContent, useEditor } from "@tiptap/react";
import { configureEditor } from "./editorConfig";

interface EditorProps {
	initialContent: string;
}

export function Editor({ initialContent }: EditorProps) {
	const pageContentControl = useInputControl({
		name: "pageContent",
		formId: "edit-page",
	});

	const editor = useEditor({
		...configureEditor(initialContent),
		onCreate: ({ editor }) => {
			pageContentControl.change(editor.getHTML());
		},
		onUpdate: ({ editor }) => {
			pageContentControl.change(editor.getHTML());
		},
	});
	return <EditorContent editor={editor} />;
}

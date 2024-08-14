import { useInputControl } from "@conform-to/react";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface EditorProps {
	initialContent: string;
}

export function Editor({ initialContent }: EditorProps) {
	const pageContentControl = useInputControl({
		name: "pageContent",
		formId: "edit-page",
	});

	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
			Placeholder.configure({
				placeholder: "input content...",
			}),
		],
		content: initialContent,
		editorProps: {
			attributes: {
				class: "focus:outline-none",
			},
		},
		onUpdate: ({ editor }) => {
			pageContentControl.change(editor.getHTML());
		},
	});

	return <EditorContent editor={editor} />;
}

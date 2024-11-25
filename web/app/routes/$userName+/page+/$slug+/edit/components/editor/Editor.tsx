import { useInputControl } from "@conform-to/react";
import { EditorContent, useEditor } from "@tiptap/react";
import { EditorBubbleMenu } from "./EditorBubbleMenu";
import { EditorFloatingMenu } from "./EditorFloatingMenu";
import { configureEditor } from "./editorConfig";

interface EditorProps {
	initialContent: string;
	onContentChange: () => void;
	setEditor?: (editor: ReturnType<typeof useEditor>) => void;
}

export function Editor({
	initialContent,
	onContentChange,
	setEditor,
}: EditorProps) {
	const pageContentControl = useInputControl({
		name: "pageContent",
		formId: "edit-page",
	});
	const editor = useEditor({
		...configureEditor(initialContent),
		onCreate: ({ editor }) => {
			pageContentControl.change(editor.getHTML());
			setEditor?.(editor);
		},
		onUpdate: async ({ editor }) => {
			pageContentControl.change(editor.getHTML());
			onContentChange();
		},
		editorProps: {
			attributes: {
				"data-testid": "tiptap-editor",
				class: "focus:outline-none",
			},
		},
	});

	return (
		<>
			{editor && <EditorBubbleMenu editor={editor} />}
			{editor && <EditorFloatingMenu editor={editor} />}
			<EditorContent editor={editor} />
		</>
	);
}

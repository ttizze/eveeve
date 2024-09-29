import { useInputControl } from "@conform-to/react";
import { EditorContent, useEditor } from "@tiptap/react";
import { EditorBubbleMenu } from "./EditorBubbleMenu";
import { EditorFloatingMenu } from "./EditorFloatingMenu";
import { configureEditor } from "./editorConfig";
interface EditorProps {
	initialContent: string;
	setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
}

export function Editor({ initialContent, setHasUnsavedChanges }: EditorProps) {
	const pageContentControl = useInputControl({
		name: "pageContent",
		formId: "edit-page",
	});
	const editor = useEditor({
		...configureEditor(initialContent),
		onCreate: ({ editor }) => {
			pageContentControl.change(editor.getHTML());
		},
		onUpdate: async ({ editor }) => {
			pageContentControl.change(editor.getHTML());
			setHasUnsavedChanges(true);
		},
		editorProps: {
			attributes: {
				"data-testid": "tiptap-editor",
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

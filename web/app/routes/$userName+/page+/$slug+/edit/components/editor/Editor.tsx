import { useInputControl } from "@conform-to/react";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect } from "react";
import { EditorBubbleMenu } from "./EditorBubbleMenu";
import { EditorFloatingMenu } from "./EditorFloatingMenu";
import { configureEditor } from "./editorConfig";
interface EditorProps {
	initialContent: string;
	handleAutoSave: () => void;
}

export function Editor({ initialContent, handleAutoSave }: EditorProps) {
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
			handleAutoSave();
		},
	});
	useEffect(() => {
		if (editor && editor.getHTML() !== initialContent) {
			editor.commands.setContent(initialContent);
		}
	}, [editor, initialContent]);

	return (
		<>
			{editor && <EditorBubbleMenu editor={editor} />}
			{editor && <EditorFloatingMenu editor={editor} />}
			<EditorContent editor={editor} />
		</>
	);
}

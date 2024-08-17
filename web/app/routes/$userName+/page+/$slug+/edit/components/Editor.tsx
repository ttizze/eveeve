import { useInputControl } from "@conform-to/react";
import { Extension } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const CustomDataAttribute = Extension.create({
	name: "customDataAttribute",

	addGlobalAttributes() {
		return [
			{
				types: ["paragraph", "heading"],
				attributes: {
					"data-source-text-id": {
						default: null,
						parseHTML: (element) => element.getAttribute("data-source-text-id"),
					},
				},
			},
		];
	},
});
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
			StarterKit.configure({
				heading: { levels: [2, 3, 4] },
			}),
			Link.configure({
				autolink: true,
			}),
			Placeholder.configure({
				placeholder: "input content...",
			}),
			CustomDataAttribute,
		],
		content: initialContent,
		editorProps: {
			attributes: {
				class: "focus:outline-none",
			},
		},
		onCreate: ({ editor }) => {
			pageContentControl.change(editor.getHTML());
		},
		onUpdate: ({ editor }) => {
			pageContentControl.change(editor.getHTML());
		},
	});

	return <EditorContent editor={editor} />;
}

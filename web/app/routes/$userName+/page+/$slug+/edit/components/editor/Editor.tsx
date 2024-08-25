import { useInputControl } from "@conform-to/react";
import { EditorContent, FloatingMenu, useEditor } from "@tiptap/react";
import { ImageIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { EditorBubbleMenu } from "./EditorBubbleMenu";
import { configureEditor } from "./editorConfig";
import { handleFileUpload } from "./useFileUpload";
interface EditorProps {
	initialContent: string;
}

export function Editor({ initialContent }: EditorProps) {
	const pageContentControl = useInputControl({
		name: "pageContent",
		formId: "edit-page",
	});
	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file && editor) {
			handleFileUpload(file, editor);
		}
	};
	const editor = useEditor({
		...configureEditor(initialContent),
		onCreate: ({ editor }) => {
			pageContentControl.change(editor.getHTML());
		},
		onUpdate: ({ editor }) => {
			pageContentControl.change(editor.getHTML());
		},
	});
	return (
		<>
			{editor && <EditorBubbleMenu editor={editor} />}
			{editor && (
				<FloatingMenu
					editor={editor}
					tippyOptions={{
						duration: 200,
						placement: "bottom-start",
						offset: [0, 25],
						arrow: false,
						theme: "custom-transparent",
					}}
					className="w-5 h-5"
				>
					<div className="floating-menu">
						<Button
							variant="ghost"
							size="icon"
							type="button"
							onClick={() => document.getElementById("imageUpload")?.click()}
							className="w-full h-full p-0"
						>
							<ImageIcon className="w-full h-full opacity-50" />
						</Button>
					</div>
				</FloatingMenu>
			)}
			<input
				id="imageUpload"
				type="file"
				accept="image/*"
				onChange={handleImageUpload}
				style={{ display: "none" }}
			/>
			<EditorContent editor={editor} />
		</>
	);
}

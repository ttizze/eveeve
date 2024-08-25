import { useInputControl } from "@conform-to/react";
import {
	BubbleMenu,
	EditorContent,
	FloatingMenu,
	type Editor as TiptapEditor,
	useEditor,
} from "@tiptap/react";
import {
	Bold,
	Brackets,
	Code,
	Heading2,
	ImageIcon,
	Italic,
	List,
	ListOrdered,
	Quote,
	Strikethrough,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { configureEditor } from "./editorConfig";
import { handleFileUpload } from "./useFileUpload";
interface EditorProps {
	initialContent: string;
}

type EditorCommand = (editor: TiptapEditor) => boolean;

const editorCommands: Record<string, EditorCommand> = {
	bold: (editor) => editor.chain().focus().toggleBold().run(),
	italic: (editor) => editor.chain().focus().toggleItalic().run(),
	strike: (editor) => editor.chain().focus().toggleStrike().run(),
	code: (editor) => editor.chain().focus().toggleCode().run(),
	codeBlock: (editor) => editor.chain().focus().toggleCodeBlock().run(),
	heading: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
	bulletList: (editor) => editor.chain().focus().toggleBulletList().run(),
	orderedList: (editor) => editor.chain().focus().toggleOrderedList().run(),
	blockquote: (editor) => editor.chain().focus().toggleBlockquote().run(),
};

export function Editor({ initialContent }: EditorProps) {
	const pageContentControl = useInputControl({
		name: "pageContent",
		formId: "edit-page",
	});
	const handleImageUpload = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/*";
		input.onchange = async (event) => {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (file && editor) {
				handleFileUpload(file, editor);
			}
		};
		input.click();
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
			{editor && (
				<BubbleMenu
					editor={editor}
					tippyOptions={{ duration: 100 }}
					className="rounded-md shadow-sm bg-transparent"
				>
					<TooltipProvider>
						<ToggleGroup
							type="multiple"
							variant="outline"
							className="rounded-md shadow-sm bg-transparent"
						>
							{[
								{
									value: "bold",
									label: "Bold",
									icon: Bold,
									shortcut: "Ctrl+B",
									isActive: () => editor.isActive("bold"),
								},
								{
									value: "italic",
									label: "Italic",
									icon: Italic,
									shortcut: "Ctrl+I",
									isActive: () => editor.isActive("italic"),
								},
								{
									value: "strike",
									label: "Strikethrough",
									icon: Strikethrough,
									shortcut: "Ctrl+Shift+X",
									isActive: () => editor.isActive("strike"),
								},
								{
									value: "code",
									label: "Code",
									icon: Code,
									shortcut: "Ctrl+E",
									isActive: () => editor.isActive("code"),
								},
								{
									value: "codeBlock",
									label: "Code Block",
									icon: Brackets,
									shortcut: "Ctrl+Shift+E",
									isActive: () => editor.isActive("codeBlock"),
								},
								{
									value: "heading",
									label: "Heading",
									icon: Heading2,
									shortcut: "Ctrl+Alt+2",
									isActive: () => editor.isActive("heading", { level: 2 }),
								},
								{
									value: "bulletList",
									label: "Bullet List",
									icon: List,
									shortcut: "Ctrl+Shift+8",
									isActive: () => editor.isActive("bulletList"),
								},
								{
									value: "orderedList",
									label: "Ordered List",
									icon: ListOrdered,
									shortcut: "Ctrl+Shift+7",
									isActive: () => editor.isActive("orderedList"),
								},
								{
									value: "blockquote",
									label: "Blockquote",
									icon: Quote,
									shortcut: "Ctrl+Shift+B",
									isActive: () => editor.isActive("blockquote"),
								},
							].map(({ value, label, icon: Icon, shortcut, isActive }) => (
								<Tooltip key={value}>
									<TooltipTrigger asChild>
										<ToggleGroupItem
											value={value}
											size="sm"
											aria-label={label}
											data-state={isActive() ? "on" : "off"}
											onClick={() => editorCommands[value](editor)}
											className="data-[state=off]:bg-gray-500 data-[state=off]:text-foreground data-[state=on]:bg-black data-[state=on]:text-white"
										>
											<Icon className="h-4 w-4" />
										</ToggleGroupItem>
									</TooltipTrigger>
									<TooltipContent>
										<p>
											{label} ({shortcut})
										</p>
									</TooltipContent>
								</Tooltip>
							))}
						</ToggleGroup>
					</TooltipProvider>
				</BubbleMenu>
			)}
			{editor && (
				<FloatingMenu
					editor={editor}
					tippyOptions={{
						duration: 200,
						placement: "left",
						arrow: false,
						theme: "custom-transparent",
					}}
				>
					<div className="floating-menu">
						<Button
							variant="ghost"
							size="icon"
							onClick={handleImageUpload}
							className="bg-transparent"
						>
							<ImageIcon className="h-5 w-5" />
						</Button>
					</div>
				</FloatingMenu>
			)}
			<EditorContent editor={editor} />
		</>
	);
}

import { BubbleMenu, type Editor as TiptapEditor } from "@tiptap/react";
import {
	Bold,
	Brackets,
	Code,
	Heading2,
	Italic,
	List,
	ListOrdered,
	Quote,
	Strikethrough,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";

interface EditorBubbleMenuProps {
	editor: TiptapEditor;
}

const editorCommands: Record<string, (editor: TiptapEditor) => boolean> = {
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

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
	return (
		<BubbleMenu
			editor={editor}
			tippyOptions={{
				duration: 100,
				arrow: false,
				theme: "custom-transparent",
			}}
		>
			<TooltipProvider>
				<ToggleGroup type="multiple" variant="outline">
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
							<TooltipContent className="bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200">
								<p>
									{label} ({shortcut})
								</p>
							</TooltipContent>
						</Tooltip>
					))}
				</ToggleGroup>
			</TooltipProvider>
		</BubbleMenu>
	);
}

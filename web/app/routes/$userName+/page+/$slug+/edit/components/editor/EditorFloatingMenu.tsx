import type { Editor } from "@tiptap/core";
import { FloatingMenu } from "@tiptap/react";
import { ImageIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { handleFileUpload } from "./useFileUpload";
import { Label } from '~/components/ui/label';

interface EditorFloatingMenuProps {
	editor: Editor;
}

export function EditorFloatingMenu({ editor }: EditorFloatingMenuProps) {
	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			handleFileUpload(file, editor);
		}
	};

	return (
		<>
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
            area-Label="Upload image"
					>
						<ImageIcon className="w-full h-full opacity-50" />
					</Button>
				</div>
			</FloatingMenu>
			<input
				id="imageUpload"
				type="file"
				accept="image/*"
				onChange={handleImageUpload}
				style={{ display: "none" }}
			/>
		</>
	);
}

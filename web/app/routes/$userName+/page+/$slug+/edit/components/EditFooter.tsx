import { ModeToggle } from "~/components/dark-mode-toggle";

export function EditFooter() {
	return (
		<footer className="fixed bottom-0 left-2 right-2 bg-background  border-border z-10">
			<div className="w-full py-4  flex justify-between items-center">
				<div>{/* ここに他のフッター要素を追加できます */}</div>
				<ModeToggle />
			</div>
		</footer>
	);
}

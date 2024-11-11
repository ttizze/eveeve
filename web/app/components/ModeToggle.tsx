import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "~/components/ui/button";

export function ModeToggle() {
	const { theme, setTheme } = useTheme();
	const isDark = theme === "dark";

	function toggleTheme() {
		setTheme(isDark ? "light" : "dark");
	}

	return (
		<Button
			variant="ghost"
			onClick={toggleTheme}
			className="gap-2 justify-start w-full text-left px-4 py-2"
		>
			<Sun
				className={`w-4 h-4 transition-all ${isDark ? "rotate-0 scale-100 " : "hidden"}`}
			/>
			<Moon
				className={`w-4 h-4 transition-all ${isDark ? "hidden" : "rotate-0 scale-100 text-gray-800"}`}
			/>
			<span>{isDark ? "Light Theme" : "Dark Theme"}</span>
		</Button>
	);
}

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { forwardRef } from "react";

export const ModeToggle = forwardRef<HTMLButtonElement>((props, ref) => {
	const { theme, setTheme } = useTheme();
	const isDark = theme === "dark";

	function toggleTheme() {
		setTheme(isDark ? "light" : "dark");
	}

	return (
		<button
			ref={ref}
			type="button"
			onClick={toggleTheme}
			className="w-full gap-2 flex cursor-pointer items-center px-6 py-4 text-sm hover:bg-accent hover:text-accent-foreground"
		>
			<Sun
				className={`w-4 h-4  ${isDark ? "rotate-0 scale-100 " : "hidden"}`}
			/>
			<Moon
				className={`w-4 h-4 ${isDark ? "hidden" : "rotate-0 scale-100 text-gray-800"}`}
			/>
			<span>{isDark ? "Light Theme" : "Dark Theme"}</span>
		</button>
	);
});

ModeToggle.displayName = "ModeToggle";

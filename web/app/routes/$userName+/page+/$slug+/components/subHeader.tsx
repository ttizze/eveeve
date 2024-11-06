import { Link } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

// スクロール制御用のカスタムフック
function useScroll(threshold = 10) {
	const [isVisible, setIsVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;

			// 上にスクロールした時は表示
			// 下にスクロールした時は非表示
			if (currentScrollY < lastScrollY) {
				setIsVisible(true);
			} else if (currentScrollY > lastScrollY && currentScrollY > threshold) {
				setIsVisible(false);
			}

			setLastScrollY(currentScrollY);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [lastScrollY, threshold]);

	return isVisible;
}

interface SubHeaderProps {
	userName?: string;
	pageSlug?: string;
}

export function SubHeader({ userName, pageSlug }: SubHeaderProps) {
	const isVisible = useScroll();

	return (
		<header
			className={`
        sticky top-0 z-10 p-2 
        bg-background bg-opacity-50 backdrop-blur-md border-b
        transition-transform duration-300
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
      `}
		>
			<div className="flex items-center">
				<Link
					to={pageSlug ? `/${userName}/page/${pageSlug}` : `/${userName}`}
					className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
				>
					<ArrowLeft className="w-6 h-6 opacity-50" />
				</Link>
				{/* 必要に応じて他の要素を追加 */}
			</div>
		</header>
	);
}

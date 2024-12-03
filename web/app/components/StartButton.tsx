import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";

interface StartButtonProps {
	className?: string;
}

export function StartButton({ className }: StartButtonProps) {
	const navigate = useNavigate();
	return (
		<Button
			onClick={() => navigate("/auth/login")}
			variant="outline"
			className={`${className} rounded-full`}
			size="lg"
		>
			Start
		</Button>
	);
}

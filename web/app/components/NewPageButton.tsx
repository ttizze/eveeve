import { useNavigate } from "@remix-run/react";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
interface NewPageButtonProps {
	userName: string;
}

export function NewPageButton({ userName }: NewPageButtonProps) {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const handleNewPage = () => {
		setIsLoading(true);
		const newSlug = crypto.randomUUID();
		navigate(`/${userName}/page/${newSlug}/edit`);
		setIsLoading(false);
	};

	return (
		<Button onClick={handleNewPage} variant="ghost" disabled={isLoading}>
			<PlusCircle className="h-6 w-6" />
		</Button>
	);
}

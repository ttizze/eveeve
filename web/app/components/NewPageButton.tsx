import { useNavigate } from "@remix-run/react";
import { PlusCircle } from "lucide-react";
import { Button } from "~/components/ui/button";

interface NewPageButtonProps {
	userId: number;
}

export function NewPageButton({ userId }: NewPageButtonProps) {
	const navigate = useNavigate();

	const handleNewPage = () => {
		const newSlug = crypto.randomUUID();
		navigate(`/${userId}/page/${newSlug}/edit`);
	};

	return (
		<Button onClick={handleNewPage} variant="ghost">
			<PlusCircle className="h-6 w-6" />
		</Button>
	);
}

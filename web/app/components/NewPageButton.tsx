import { useNavigate } from "@remix-run/react";
import { useNavigation } from "@remix-run/react";
import { PlusCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
interface NewPageButtonProps {
	userName: string;
}

export function NewPageButton({ userName }: NewPageButtonProps) {
	const navigate = useNavigate();
	const navigation = useNavigation();
	const isLoading = navigation.state === "loading";
	const handleNewPage = () => {
		const newSlug = crypto.randomUUID();
		navigate(`/${userName}/page/${newSlug}/edit`);
	};

	return (
		<Button onClick={handleNewPage} variant="ghost" disabled={isLoading}>
			<PlusCircle className="h-6 w-6" />
		</Button>
	);
}

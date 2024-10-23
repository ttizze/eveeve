import { useNavigate } from "@remix-run/react";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";

const generateSlug = (length = 8): string => {
	const charset =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let slug = "";
	while (slug.length < length) {
		const byte = crypto.getRandomValues(new Uint8Array(1))[0];
		if (byte < 248) {
			slug += charset[byte % 62];
		}
	}
	return slug;
};
interface NewPageButtonProps {
	userName: string;
}

export function NewPageButton({ userName }: NewPageButtonProps) {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const handleNewPage = () => {
		setIsLoading(true);
		const newSlug = generateSlug();
		navigate(`/${userName}/page/${newSlug}/edit`);
	};

	return (
		<Button onClick={handleNewPage} variant="ghost" disabled={isLoading}>
			{isLoading ? (
				<Loader2 className="h-6 w-6 animate-spin" />
			) : (
				<PlusCircle className="h-6 w-6" />
			)}
		</Button>
	);
}

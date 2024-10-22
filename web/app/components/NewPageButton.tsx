import { useNavigate } from "@remix-run/react";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";

const generateSlug = (length = 8): string =>
	Array.from(crypto.getRandomValues(new Uint8Array(length)))
		.map(
			(byte) =>
				"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[
					byte % 62
				],
		)
		.join("");
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

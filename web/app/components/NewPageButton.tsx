import { useNavigate } from "@remix-run/react";
import { Loader2, PencilIcon } from "lucide-react";
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
		<Button
			onClick={handleNewPage}
			variant="ghost"
			disabled={isLoading}
			className="gap-2"
		>
			{isLoading ? (
				<Loader2 className="h-4 w-4 animate-spin" />
			) : (
				<>
					<PencilIcon className="h-4 w-4" />
					<span>Write</span>
				</>
			)}
		</Button>
	);
}

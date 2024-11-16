import { useNavigate } from "@remix-run/react";
import { Loader2, PencilIcon } from "lucide-react";
import { forwardRef, useState } from "react";

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

export const NewPageButton = forwardRef<HTMLButtonElement, NewPageButtonProps>(
	({ userName }, ref) => {
		const navigate = useNavigate();
		const [isLoading, setIsLoading] = useState(false);
		const handleNewPage = () => {
			setIsLoading(true);
			const newSlug = generateSlug();
			navigate(`/${userName}/page/${newSlug}/edit`);
		};

		return (
			<button
				type="button"
				onClick={handleNewPage}
				disabled={isLoading}
				className="w-full  gap-2 flex cursor-pointer items-center  px-6 py-4 text-sm hover:bg-accent hover:text-accent-foreground"
			>
				{isLoading ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<>
						<PencilIcon className="h-4 w-4" />
						Write
					</>
				)}
			</button>
		);
	},
);

NewPageButton.displayName = "NewPageButton";

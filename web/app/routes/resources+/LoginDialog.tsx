import { useLocation } from "@remix-run/react";
import { LogIn } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { GoogleForm } from "./google-form";

interface LoginDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ isOpen, onOpenChange }: LoginDialogProps) {
	const location = useLocation();
	return (
		<Dialog modal={false} open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="rounded-xl">
				<DialogHeader>
					<DialogTitle className="flex items-center justify-center">
						<LogIn className="h-4 w-4 mr-2" />
					</DialogTitle>
					<DialogDescription className="text-center">Login</DialogDescription>
				</DialogHeader>
				<GoogleForm redirectTo={location.pathname + location.search} />
			</DialogContent>
		</Dialog>
	);
}

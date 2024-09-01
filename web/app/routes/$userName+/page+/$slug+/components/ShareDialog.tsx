import { Share } from "lucide-react";
import { useState } from "react";
import {
	FacebookIcon,
	FacebookShareButton,
	RedditIcon,
	RedditShareButton,
	TwitterShareButton,
	XIcon,
} from "react-share";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";

interface ShareDialogProps {
	url: string;
	title: string;
}

export function ShareDialog({ url, title }: ShareDialogProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen} modal={false}>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon">
					<Share className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Share</DialogTitle>
				</DialogHeader>
				<div className="flex justify-center space-x-4 mt-4">
					<FacebookShareButton url={url}>
						<FacebookIcon size={32} round />
					</FacebookShareButton>
					<TwitterShareButton url={url} title={title}>
						<XIcon size={32} round />
					</TwitterShareButton>
					<RedditShareButton url={url} title={title}>
						<RedditIcon size={32} round />
					</RedditShareButton>
				</div>
			</DialogContent>
		</Dialog>
	);
}

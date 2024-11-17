import type { ActionFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { Heart } from "lucide-react";
import { Button } from "~/components/ui/button";
import { authenticator } from "~/utils/auth.server";
import { toggleLike } from "./functions/mutations.server";

export async function action({ params, request }: ActionFunctionArgs) {
	const user = await authenticator.isAuthenticated(request, {
		failureRedirect: "/auth/login",
	});
	const formData = await request.formData();
	const slug = formData.get("slug") as string;
	const liked = await toggleLike(user.id, slug);
	return { liked };
}

type LikeButtonProps = {
	liked: boolean;
	likeCount: number;
	slug: string;
	showCount?: boolean;
	className?: string;
};

export function LikeButton({
	liked,
	likeCount,
	slug,
	showCount,
	className = "",
}: LikeButtonProps) {
	const fetcher = useFetcher<typeof action>();

	return (
		<div className="flex items-center gap-2">
			<fetcher.Form method="post" action={"/resources/like-button"}>
				<input type="hidden" name="slug" value={slug} />
				<Button
					type="submit"
					aria-label="Like"
					variant="secondary"
					size="icon"
					className={`h-12 w-12 rounded-full shadow-lg ${className}`}
					disabled={fetcher.state === "submitting"}
				>
					<Heart
						className={`h-5 w-5 ${liked ? "text-red-500" : ""}`}
						fill={liked ? "currentColor" : "none"}
					/>
				</Button>
			</fetcher.Form>
			{showCount && <span className="text-muted-foreground">{likeCount}</span>}
		</div>
	);
}

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
};

export function LikeButton({ liked, likeCount, slug }: LikeButtonProps) {
	const fetcher = useFetcher<typeof action>();

	return (
		<fetcher.Form method="post" action={"/resources/like-button"}>
			<input type="hidden" name="slug" value={slug} />
			<Button
				type="submit"
				aria-label="Like"
				variant="secondary"
				className={`flex items-center space-x-1 rounded-full ${
					liked ? "text-red-500" : "text-gray-500"
				} transition-all duration-200 ease-in-out transform active:scale-110 hover:scale-105`}
				disabled={fetcher.state === "submitting"}
			>
				<Heart className="h-6 w-6" fill={liked ? "currentColor" : "none"} />
				<span>{likeCount}</span>
			</Button>
		</fetcher.Form>
	);
}

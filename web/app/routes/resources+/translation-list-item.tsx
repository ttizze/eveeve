import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { Languages } from "lucide-react";
import { Ellipsis } from "lucide-react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { TranslationWithVote } from "~/routes/$userName+/page+/$slug+/types";
import { sanitizeAndParseText } from "~/routes/$userName+/page+/$slug+/utils/sanitize-and-parse-text.client";
import { authenticator } from "~/utils/auth.server";
import { deleteOwnTranslation } from "./functions/mutations.server";
import { VoteButtons } from "./vote-buttons";

const schema = z.object({
	translationId: z.number(),
});

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const translationId = Number.parseInt(
		formData.get("translationId") as string,
	);
	const parsed = schema.safeParse({ translationId });
	if (!parsed.success) {
		return json({ error: "Invalid translationId" }, { status: 400 });
	}
	const currentUser = await authenticator.isAuthenticated(request);
	if (!currentUser) {
		return json({ error: "Unauthorized" }, { status: 403 });
	}
	await deleteOwnTranslation(currentUser.userName, parsed.data.translationId);
	return json({ success: true });
}

interface TranslationItemProps {
	translation: TranslationWithVote;
	currentUserName: string | undefined;
	showAuthor?: boolean;
}

export function TranslationListItem({
	translation,
	currentUserName,
	showAuthor = false,
}: TranslationItemProps) {
	const isOwner = currentUserName === translation.user.userName;
	const fetcher = useFetcher();

	const onDelete = () => {
		fetcher.submit(
			{ translationId: translation.translateText.id },
			{ method: "post", action: "/resources/translation-list-item" },
		);
	};

	return (
		<div className="px-3 mt-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800">
			{isOwner && (
				<div className="justify-end flex mr-2">
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button type="button" variant="ghost" className="h-8 w-8 p-0 ">
								<Ellipsis className="h-6 w-6 text-gray-400" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onSelect={onDelete}>Delete</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			)}
			<div className="mb-2">
				{sanitizeAndParseText(translation.translateText.text)}
			</div>
			{showAuthor && (
				<Link to={`/${translation.user.userName}`} className="!no-underline">
					<p className="text-sm text-gray-500 text-right flex justify-end items-center  ">
						<Languages className="w-5 h-5 mr-2" /> by:{" "}
						{translation.user.displayName}
					</p>
				</Link>
			)}
			<VoteButtons
				translationWithVote={translation}
				currentUserName={currentUserName}
			/>
		</div>
	);
}

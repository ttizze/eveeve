import { useFetcher } from "@remix-run/react";
import DOMPurify from "dompurify";
import parse from "html-react-parser";
import { Edit, Plus, X } from "lucide-react";
import { Save, Trash } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useClickOutside } from "../functions/useClickOutside";
import type { TranslationWithVote } from "../types";
import { VoteButtons } from "./VoteButtons";

interface TranslationProps {
	translationsWithVotes: TranslationWithVote[];
	targetLanguage: string;
	userId: number | null;
	sourceTextId: number;
}

export function Translation({
	translationsWithVotes,
	targetLanguage,
	userId,
	sourceTextId,
}: TranslationProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editText, setEditText] = useState("");
	const ref = useClickOutside(() => setIsExpanded(false));
	const fetcher = useFetcher();

	const bestTranslationWithVote = useMemo(() => {
		const upvotedTranslations = translationsWithVotes.filter(
			(t) => t.userVote?.isUpvote,
		);
		if (upvotedTranslations.length > 0) {
			return upvotedTranslations.reduce((prev, current) => {
				const currentUpdatedAt = current.userVote?.updatedAt ?? new Date(0);
				const prevUpdatedAt = prev.userVote?.updatedAt ?? new Date(0);
				return currentUpdatedAt > prevUpdatedAt ? current : prev;
			});
		}
		return translationsWithVotes.reduce((prev, current) =>
			prev.point > current.point ? prev : current,
		);
	}, [translationsWithVotes]);

	const alternativeTranslationsWithVotes = useMemo(
		() =>
			translationsWithVotes.filter((t) => t.id !== bestTranslationWithVote.id),
		[translationsWithVotes, bestTranslationWithVote],
	);

	const handleAddTranslation = (sourceTextId: number, text: string) => {
		fetcher.submit(
			{
				intent: "add",
				sourceTextId: sourceTextId,
				text,
			},
			{ method: "post" },
		);
	};

	return (
		<div
			ref={ref}
			lang={targetLanguage}
			className="notranslate mt-2 p-4  rounded-lg shadow-sm border border-gray-200 group relative"
		>
			<div className="text-lg font-medium ">
				{parse(
					DOMPurify.sanitize(
						bestTranslationWithVote.text.replace(/(\r\n|\n|\\n)/g, "<br />"),
					),
				)}
			</div>
			<Button
				variant="outline"
				size="sm"
				className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
				onClick={(e) => {
					e.stopPropagation();
					setIsExpanded(!isExpanded);
				}}
			>
				{isExpanded ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
			</Button>
			{isExpanded && (
				<div className="">
					<VoteButtons
						translationWithVote={bestTranslationWithVote}
						userId={userId}
					/>
					<p className="text-sm text-gray-500 text-right">
						Translated by:{bestTranslationWithVote.userName}
					</p>
					{alternativeTranslationsWithVotes.length > 0 && (
						<div className=" rounded-md">
							<p className="font-semibold text-gray-600 mb-2">
								Other translations:
							</p>
							<div className="space-y-3">
								{alternativeTranslationsWithVotes.map((alt) => (
									<div
										key={alt.id}
										className="p-2 rounded border border-gray-200"
									>
										<div className="text-sm  mb-2">{alt.text}</div>
										<VoteButtons translationWithVote={alt} userId={userId} />
									</div>
								))}
							</div>
						</div>
					)}
					{userId && (
						<div className="mt-4">
							<div className="flex justify-end">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setIsEditing(!isEditing)}
									className="text-blue-600 hover:bg-blue-50"
								>
									{isEditing ? (
										<X className="h-4 w-4" />
									) : (
										<Edit className="h-4 w-4" />
									)}
								</Button>
							</div>
							{isEditing && (
								<div className="mt-3">
									<Textarea
										value={editText}
										onChange={(e) => setEditText(e.target.value)}
										className="w-full mb-2  focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
										placeholder="Enter your translation..."
									/>
									<div className="space-x-2 flex justify-end">
										<Button
											onClick={() =>
												handleAddTranslation(sourceTextId, editText)
											}
											className="bg-green-500 hover:bg-green-600 text-white"
											disabled={!editText}
										>
											<Save className="h-4 w-4" />
										</Button>
										<Button
											variant="outline"
											onClick={() => {
												setIsEditing(false);
												setEditText("");
											}}
											className="text-red-600 hover:bg-red-50"
										>
											<Trash className=" h-4 w-4" />
										</Button>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

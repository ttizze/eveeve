import { Link } from "@remix-run/react";
import DOMPurify from "dompurify";
import parse from "html-react-parser";
import { Lock, SquarePen } from "lucide-react";
import { memo, useMemo } from "react";
import { Button } from "~/components/ui/button";
import type { PageWithTranslations } from "../types";
import { Translation } from "./Translation";

interface ContentWithTranslationsProps {
	pageWithTranslations: PageWithTranslations;
	currentUserName: string | null;
}

export const ContentWithTranslations = memo(function ContentWithTranslations({
	pageWithTranslations,
	currentUserName,
}: ContentWithTranslationsProps) {
	const bestTranslationTitle = useMemo(() => {
		return pageWithTranslations.sourceTextWithTranslations.find(
			(info) => info.number === 0,
		);
	}, [pageWithTranslations.sourceTextWithTranslations]);

	const parsedContent = useMemo(() => {
		if (typeof window === "undefined") {
			return null;
		}

		const sanitizedContent = DOMPurify.sanitize(pageWithTranslations.content);
		const doc = new DOMParser().parseFromString(sanitizedContent, "text/html");

		const elements = doc.querySelectorAll("[data-source-text-id]");
		for (const element of elements) {
			if (element instanceof HTMLElement) {
				const sourceTextId = element.getAttribute("data-source-text-id");
				const contentWrapper = document.createElement("span");
				contentWrapper.classList.add("inline-block", "px-2");
				contentWrapper.innerHTML = element.innerHTML;
				element.innerHTML = "";
				element.appendChild(contentWrapper);
				const translationElement = document.createElement("span");
				translationElement.setAttribute(
					"data-translation-id",
					sourceTextId || "",
				);
				element.appendChild(translationElement);
			}
		}

		return parse(doc.body.innerHTML, {
			replace: (domNode) => {
				if (domNode.type === "tag" && domNode.attribs["data-translation-id"]) {
					const sourceTextId = domNode.attribs["data-translation-id"];
					const translations =
						pageWithTranslations.sourceTextWithTranslations.find(
							(info) => info.sourceTextId.toString() === sourceTextId,
						);
					if (translations && translations.translationsWithVotes.length > 0) {
						return (
							<Translation
								key={`translation-${sourceTextId}`}
								translationsWithVotes={translations.translationsWithVotes}
								currentUserName={currentUserName}
								sourceTextId={translations.sourceTextId}
							/>
						);
					}
				}
				return domNode;
			},
		});
	}, [
		pageWithTranslations.content,
		pageWithTranslations.sourceTextWithTranslations,
		currentUserName,
	]);

	if (typeof window === "undefined") {
		return <div>Loading...</div>;
	}

	return (
		<>
			<h1>
				<div className="px-2">
					{!pageWithTranslations.isPublished && (
						<Lock className="h-6 w-6 mr-1 inline" />
					)}
					{pageWithTranslations.title}
				</div>
				{bestTranslationTitle && (
					<Translation
						translationsWithVotes={bestTranslationTitle.translationsWithVotes}
						currentUserName={currentUserName}
						sourceTextId={bestTranslationTitle.sourceTextId}
					/>
				)}
			</h1>
			<div className="flex items-center text-gray-500">
				<Link
					to={`/${pageWithTranslations.user.userName}`}
					className=" flex items-center mr-2 !no-underline hover:text-gray-700"
				>
					<img
						src={pageWithTranslations.user.icon}
						alt="Icon"
						className="w-14 h-14 rounded-full object-cover mx-3 !my-0"
					/>
					<div className="flex flex-col">
						<span className="text-sm">
							{pageWithTranslations.user.displayName}
						</span>
						<span className="text-xs text-gray-500">
							{pageWithTranslations.createdAt.toLocaleString()}
						</span>
					</div>
				</Link>
				{pageWithTranslations.user.userName === currentUserName &&
					currentUserName && (
						<div className="ml-auto">
							<Button asChild variant="ghost">
								<Link
									to={`/${currentUserName}/page/${pageWithTranslations.slug}/edit`}
								>
									<SquarePen className="w-5 h-5" />
								</Link>
							</Button>
						</div>
					)}
			</div>
			{parsedContent}
		</>
	);
});

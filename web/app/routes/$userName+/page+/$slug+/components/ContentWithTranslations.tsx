import { Link } from "@remix-run/react";
import DOMPurify from "dompurify";
import parse from "html-react-parser";
import { memo, useMemo } from "react";
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
				contentWrapper.classList.add("inline-block", "px-4");
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
				<div className="px-4">{pageWithTranslations.title}</div>
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
					className="text-gray-500 flex items-center mr-2 no-underline hover:text-gray-700"
				>
					{pageWithTranslations.user.displayName}
				</Link>
				<p>{pageWithTranslations.createdAt.toLocaleDateString()}</p>
			</div>
			{parsedContent}
		</>
	);
});

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
		const translationMap = new Map(
			pageWithTranslations.sourceTextWithTranslations.map((info) => [
				info.number.toString(),
				info,
			]),
		);

		for (const [number] of translationMap) {
			const element = doc.querySelector(`[data-number="${number}"]`);
			if (element instanceof HTMLElement) {
				const translationElement = doc.createElement("div");
				translationElement.setAttribute("data-translation", number);
				element.appendChild(translationElement);
			}
		}

		return parse(doc.body.innerHTML, {
			replace: (domNode) => {
				if (domNode.type === "tag" && domNode.attribs["data-translation"]) {
					const number = domNode.attribs["data-translation"];
					const translationGroup = translationMap.get(number);
					if (
						translationGroup &&
						translationGroup.translationsWithVotes.length > 0
					) {
						return (
							<Translation
								key={`translation-group-${number}`}
								translationsWithVotes={translationGroup.translationsWithVotes}
								currentUserName={currentUserName}
								sourceTextId={translationGroup.sourceTextId}
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
				{pageWithTranslations.title}
				{bestTranslationTitle && (
					<Translation
						translationsWithVotes={bestTranslationTitle.translationsWithVotes}
						currentUserName={currentUserName}
						sourceTextId={bestTranslationTitle.sourceTextId}
					/>
				)}
			</h1>
			<hr />
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

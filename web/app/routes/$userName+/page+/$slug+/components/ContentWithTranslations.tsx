import DOMPurify from "dompurify";
import parse from "html-react-parser";
import { memo, useMemo } from "react";
import type { SourceTextWithTranslations } from "../types";
import { Translation } from "./Translation";

interface ContentWithTranslationsProps {
	content: string;
	sourceTextWithTranslations: SourceTextWithTranslations[];
	userId: number | null;
}

export const ContentWithTranslations = memo(function ContentWithTranslations({
	content,
	sourceTextWithTranslations,
	userId,
}: ContentWithTranslationsProps) {
	const parsedContent = useMemo(() => {
		if (typeof window === "undefined") {
			return null;
		}

		const sanitizedContent = DOMPurify.sanitize(content);
		const doc = new DOMParser().parseFromString(sanitizedContent, "text/html");
		const translationMap = new Map(
			sourceTextWithTranslations.map((info) => [info.number.toString(), info]),
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
								userId={userId}
								sourceTextId={translationGroup.sourceTextId}
							/>
						);
					}
				}
				return domNode;
			},
		});
	}, [content, sourceTextWithTranslations, userId]);

	if (typeof window === "undefined") {
		return <div>Loading...</div>;
	}

	return <>{parsedContent}</>;
});
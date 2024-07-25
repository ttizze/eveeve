import parse from "html-react-parser";
import type { SourceTextInfoWithTranslations } from "../types";
import { Translation } from "./Translation";
import { useMemo, memo } from "react";

interface ContentWithTranslationsProps {
	content: string;
	sourceTextInfoWithTranslations: SourceTextInfoWithTranslations[];
	targetLanguage: string;
	userId: number | null;
}

export const ContentWithTranslations = memo(function ContentWithTranslations({
	content,
	sourceTextInfoWithTranslations,
	targetLanguage,
	userId,
}: ContentWithTranslationsProps) {
  const parsedContent = useMemo(() => {
		if (typeof window === "undefined") {
			return null;
		}

		const doc = new DOMParser().parseFromString(content, "text/html");
		const translationMap = new Map(
			sourceTextInfoWithTranslations.map(info => [info.number.toString(), info])
		);

		for (const [number, info] of translationMap) {
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
					if (translationGroup && translationGroup.translationsWithVotes.length > 0) {
						return (
							<Translation
								key={`translation-group-${number}`}
								translationsWithVotes={translationGroup.translationsWithVotes}
								targetLanguage={targetLanguage}
								userId={userId}
								sourceTextId={translationGroup.sourceTextId}
							/>
						);
					}
				}
				return domNode;
			},
		});
	}, [content, sourceTextInfoWithTranslations, targetLanguage, userId]);

	if (typeof window === "undefined") {
		return <div>Loading...</div>;
	}

	return <>{parsedContent}</>;
});
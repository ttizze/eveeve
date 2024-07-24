import parse from "html-react-parser";
import type { SourceTextInfoWithTranslations } from "../types";
import { Translation } from "./Translation";

interface TranslatedContentProps {
	content: string;
	sourceTextInfoWithTranslations: SourceTextInfoWithTranslations[];
	targetLanguage: string;
	userId: number | null;
}

export function TranslatedContent({
	content,
	sourceTextInfoWithTranslations,
	targetLanguage,
	userId,
}: TranslatedContentProps) {
	if (typeof window === "undefined") {
		return <div>Loading...</div>;
	}

	const doc = new DOMParser().parseFromString(content, "text/html");

	for (const { number } of sourceTextInfoWithTranslations) {
		const element = doc.querySelector(`[data-number="${number}"]`);
		if (element) {
			const translationElement = doc.createElement("div");
			translationElement.setAttribute("data-translation", number.toString());
			element.appendChild(translationElement);
		}
	}

	return (
		<>
			{parse(doc.body.innerHTML, {
				replace: (domNode) => {
					if (domNode.type === "tag" && domNode.attribs["data-translation"]) {
						const number = Number.parseInt(
							domNode.attribs["data-translation"],
							10,
						);
						const translationGroup = sourceTextInfoWithTranslations.find(
							(t) => t.number === number,
						);
						if (
							translationGroup &&
							translationGroup.translationsWithVotes.length > 0
						) {
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
			})}
		</>
	);
}

import parse from "html-react-parser";
import type { TranslationData } from "../types";
import { Translation } from "./Translation";

interface TranslatedContentProps {
	content: string;
	translations: Array<{
		number: number;
		sourceTextId: number;
		translations: TranslationData[];
	}>;
	targetLanguage: string;
	onVote: (translationId: number, isUpvote: boolean) => void;
	onAdd: (sourceTextId: number, text: string) => void;
	userId: number | null;
}

export function TranslatedContent({
	content,
	translations,
	targetLanguage,
	onVote,
	onAdd,
	userId,
}: TranslatedContentProps) {
	if (typeof window === "undefined") {
		return <div>Loading...</div>;
	}

	const doc = new DOMParser().parseFromString(content, "text/html");

	for (const { number } of translations) {
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
						const translationGroup = translations.find(
							(t) => t.number === number,
						);
						if (translationGroup && translationGroup.translations.length > 0) {
							return (
								<Translation
									key={`translation-group-${number}`}
									translations={translationGroup.translations}
									targetLanguage={targetLanguage}
									onVote={onVote}
									onAdd={onAdd}
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

import DOMPurify from "dompurify";
import parse, { type HTMLReactParserOptions } from "html-react-parser";
import type { PageWithTranslations } from "../types";
import { SourceTextAndTranslationSection } from "./sourceTextAndTranslationSection/SourceTextAndTranslationSection";

interface ParsedContentProps {
	pageWithTranslations: PageWithTranslations;
	sourceLanguage: string;
	targetLanguage: string;
	currentUserName: string | undefined;
}

export function ParsedContent({
	pageWithTranslations,
	sourceLanguage,
	targetLanguage,
	currentUserName,
}: ParsedContentProps) {
	const sanitizedContent = DOMPurify.sanitize(pageWithTranslations.content);
	const doc = new DOMParser().parseFromString(sanitizedContent, "text/html");

	const options: HTMLReactParserOptions = {
		replace: (domNode) => {
			if (domNode.type === "tag" && domNode.attribs["data-source-text-id"]) {
				const sourceTextId = Number(domNode.attribs["data-source-text-id"]);
				const sourceTextWithTranslation =
					pageWithTranslations.sourceTextWithTranslations.find(
						(info) => info.sourceText.id === sourceTextId,
					);
				if (!sourceTextWithTranslation) {
					return null;
				}
				const DynamicTag = domNode.name as keyof JSX.IntrinsicElements;
				const { class: className, ...otherAttribs } = domNode.attribs;
				return (
					<DynamicTag {...otherAttribs} className={className}>
						<SourceTextAndTranslationSection
							key={`translation-${sourceTextId}`}
							sourceTextWithTranslation={sourceTextWithTranslation}
							currentUserName={currentUserName}
							sourceLanguage={sourceLanguage}
							targetLanguage={targetLanguage}
						/>
					</DynamicTag>
				);
			}
			if (domNode.type === "tag" && domNode.name === "img") {
				const { src, alt, width, height, ...otherAttribs } = domNode.attribs;
				return (
					//otherAttribs がbiomeのlintに引っかかる
					// biome-ignore lint/a11y/useAltText: <explanation>
					<img
						src={src}
						alt={alt || ""}
						width={width || "100%"}
						height={height || "auto"}
						className="aspect-ratio-img"
						{...otherAttribs}
					/>
				);
			}
			return domNode;
		},
	};

	return parse(doc.body.innerHTML, options);
}

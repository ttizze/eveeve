import type { UseFloatingReturn } from "@floating-ui/react";
import DOMPurify from "dompurify";
import parse, {
	type HTMLReactParserOptions,
	domToReact,
	type DOMNode,
} from "html-react-parser";
import { memo } from "react";
import type { PageWithTranslations } from "../types";
import { SourceTextAndTranslationSection } from "./sourceTextAndTranslationSection/SourceTextAndTranslationSection";

interface ParsedContentProps {
	pageWithTranslations: PageWithTranslations;
	sourceLanguage: string;
	targetLanguage: string;
	currentUserName: string | undefined;
	onOpenAddAndVoteTranslations: (sourceTextId: number) => void;
	showOriginal: boolean;
	showTranslation: boolean;
	selectedSourceTextId: number | null;
	onSelectedRef?: (el: HTMLDivElement | null) => void;
}

export const MemoizedParsedContent = memo(ParsedContent);

export function ParsedContent({
	pageWithTranslations,
	sourceLanguage,
	targetLanguage,
	onOpenAddAndVoteTranslations,
	showOriginal = true,
	showTranslation = true,
	selectedSourceTextId,
	onSelectedRef,
}: ParsedContentProps) {
	const sanitizedContent = DOMPurify.sanitize(
		pageWithTranslations.page.content,
	);
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
				if (domNode.name === "a") {
					return (
						<a
							href={domNode.attribs.href}
							className="underline underline-offset-4 decoration-blue-500"
						>
							{domToReact(domNode.children as DOMNode[], options)}
						</a>
					);
				}
				const DynamicTag = domNode.name as keyof JSX.IntrinsicElements;
				const { class: className, ...otherAttribs } = domNode.attribs;
				return (
					<DynamicTag {...otherAttribs} className={className}>
						<SourceTextAndTranslationSection
							key={`translation-${sourceTextId}`}
							sourceTextWithTranslations={sourceTextWithTranslation}
							elements={domToReact(domNode.children as DOMNode[], options)}
							sourceLanguage={sourceLanguage}
							targetLanguage={targetLanguage}
							onOpenAddAndVoteTranslations={onOpenAddAndVoteTranslations}
							showOriginal={showOriginal}
							showTranslation={showTranslation}
							selectedSourceTextId={selectedSourceTextId}
							onSelectedRef={onSelectedRef}
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

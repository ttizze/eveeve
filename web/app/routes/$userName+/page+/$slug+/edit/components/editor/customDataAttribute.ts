import { Extension } from "@tiptap/core";

//sourceTextIdを付与したpage.contentを保存するために使用する
export const CustomDataAttribute = Extension.create({
	name: "customDataAttribute",
	addGlobalAttributes() {
		return [
			{
				types: ["paragraph", "heading", "link"],
				attributes: {
					"data-source-text-id": {
						default: null,
						parseHTML: (element) => element.getAttribute("data-source-text-id"),
					},
				},
			},
		];
	},
});

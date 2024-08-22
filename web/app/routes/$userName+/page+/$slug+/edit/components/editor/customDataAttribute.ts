import { Extension } from "@tiptap/core";

export const CustomDataAttribute = Extension.create({
	name: "customDataAttribute",
	addGlobalAttributes() {
		return [
			{
				types: ["paragraph", "heading"],
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

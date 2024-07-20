import { useFetcher } from "@remix-run/react";
import { useCallback, useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

type TargetLanguage = {
	code: string;
	name: string;
};

const targetLanguages: TargetLanguage[] = [
	{ code: "ja", name: "日本語" },
	{ code: "en", name: "English" },
	{ code: "zh", name: "中文" },
	{ code: "ko", name: "한국어" },
	{ code: "es", name: "Español" },
	{ code: "fr", name: "Français" },
];

export function TargetLanguageSelect() {
	const fetcher = useFetcher<{ targetLanguage: string }>();
	const [currentLanguage, setCurrentLanguage] = useState(
		fetcher.data?.targetLanguage ?? "ja",
	);

	const loadLanguage = useCallback(() => {
		if (fetcher.state === "idle" && !fetcher.data) {
			fetcher.load("/api/target-language");
		}
	}, [fetcher]);

	useEffect(() => {
		loadLanguage();
	}, [loadLanguage]);

	const handleLanguageChange = (value: string) => {
		setCurrentLanguage(value);
		fetcher.submit(
			{ targetLanguage: value },
			{ method: "post", action: "/api/target-language" },
		);
	};

	return (
		<Select value={currentLanguage} onValueChange={handleLanguageChange}>
			<SelectTrigger className="w-[100px]">
				<SelectValue placeholder="翻訳言語を選択" />
			</SelectTrigger>
			<SelectContent>
				{targetLanguages.map((lang) => (
					<SelectItem key={lang.code} value={lang.code}>
						{lang.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

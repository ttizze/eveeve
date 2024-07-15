import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

type Language = {
	code: string;
	name: string;
};

const languages: Language[] = [
	{ code: "ja", name: "日本語" },
	{ code: "en", name: "English" },
	{ code: "zh", name: "中文" },
	{ code: "ko", name: "한국어" },
	{ code: "es", name: "Español" },
	{ code: "fr", name: "Français" },
];

type TranslationLanguageSelectProps = {
	value: string;
	onChange: (value: string) => void;
};

export function TranslationLanguageSelect({
	value,
	onChange,
}: TranslationLanguageSelectProps) {
	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger className="w-[180px]">
				<SelectValue placeholder="翻訳言語を選択" />
			</SelectTrigger>
			<SelectContent>
				{languages.map((lang) => (
					<SelectItem key={lang.code} value={lang.code}>
						{lang.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

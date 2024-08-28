import { useFetcher } from "@remix-run/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "~/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { targetLanguages } from "~/constants/languages";
import { cn } from "~/utils/cn";

interface TargetLanguageSelectorProps {
	targetLanguage: string;
}

export default function TargetLanguageSelector({
	targetLanguage,
}: TargetLanguageSelectorProps) {
	const fetcher = useFetcher<{ targetLanguage: string }>();
	const [open, setOpen] = useState(false);

	const [currentLanguage, setCurrentLanguage] = useState(targetLanguage);

	const loadLanguage = useCallback(() => {
		if (fetcher.state === "idle" && !fetcher.data) {
			fetcher.load("/api/target-language");
		} else if (fetcher.state === "idle" && fetcher.data?.targetLanguage) {
			setCurrentLanguage(fetcher.data.targetLanguage);
		}
	}, [fetcher]);

	useEffect(() => {
		loadLanguage();
	}, [loadLanguage]);
	const handleLanguageChange = (value: string) => {
		setCurrentLanguage(value);
		setOpen(false);
		fetcher.submit(
			{ targetLanguage: value },
			{ method: "post", action: "/api/target-language" },
		);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between"
				>
					<span className="truncate">
						{currentLanguage
							? targetLanguages.find((lang) => lang.code === currentLanguage)
									?.name
							: "select"}
					</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0 truncate">
				<Command>
					<CommandInput placeholder="search..." />
					<CommandList>
						<CommandEmpty>No languages found.</CommandEmpty>
						<CommandGroup>
							{targetLanguages.map((lang) => (
								<CommandItem
									key={lang.code}
									value={lang.code}
									onSelect={handleLanguageChange}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											currentLanguage === lang.code
												? "opacity-100"
												: "opacity-0",
										)}
									/>
									<span className="truncate">{lang.name}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

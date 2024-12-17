import { useFetcher } from "@remix-run/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
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
import { supportedLocales } from "~/constants/languages";
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

	const handleLanguageChange = (value: string) => {
		setCurrentLanguage(value);
		setOpen(false);
		fetcher.submit(
			{ targetLanguage: value },
			{ method: "post", action: "/resources/api/target-language" },
		);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					aria-expanded={open}
					className="w-full justify-between rounded-xl"
				>
					<span className="truncate">
						{currentLanguage
							? supportedLocales.find(
									(locale) => locale.code === currentLanguage,
								)?.name
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
							{supportedLocales.map((locale) => (
								<CommandItem
									key={locale.code}
									value={locale.code}
									onSelect={handleLanguageChange}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											currentLanguage === locale.code
												? "opacity-100"
												: "opacity-0",
										)}
									/>
									<span className="truncate">{locale.name}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

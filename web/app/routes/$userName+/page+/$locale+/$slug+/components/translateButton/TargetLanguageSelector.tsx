import { useState } from "react";
import { Button } from "~/components/ui/button";
import { supportedLocales } from "~/constants/languages";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList, CommandInput, CommandEmpty } from "~/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "~/utils/cn";
import { useParams } from "@remix-run/react";

interface LocaleSelectorProps {
	locale: string;
}

export default function LocaleSelector({ locale }: LocaleSelectorProps) {
	const [open, setOpen] = useState(false);
	const [currentLocale, setCurrentLocale] = useState(locale);

	const params = useParams();
	const { userName, slug } = params;

	const handleLocaleChange = (value: string) => {
		setCurrentLocale(value);
		setOpen(false);
		const newUrl = `/${userName}/page/${value}/${slug}`;
		window.location.href = newUrl;
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" className="w-full justify-between rounded-xl">
					<span className="truncate">
						{supportedLocales.find((locale) => locale.code === currentLocale)?.name ?? "Select"}
					</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0 truncate">
				<Command>
					<CommandInput placeholder="search..." />
					<CommandList>
						<CommandEmpty>No locales found.</CommandEmpty>
						<CommandGroup>
							{supportedLocales.map((locale) => (
								<CommandItem
									key={locale.code}
									value={locale.code}
									onSelect={handleLocaleChange}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											currentLocale === locale.code ? "opacity-100" : "opacity-0",
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

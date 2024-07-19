import {
	type FieldMetadata,
	unstable_useControl as useControl,
} from "@conform-to/react";
import {
	type ComponentProps,
	type ElementRef,
	type ReactNode,
	useRef,
} from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

export const SelectConform = ({
	meta,
	items,
	placeholder,
	onValueChange,
	...props
}: {
	meta: FieldMetadata<string>;
	items: Array<{ name: ReactNode; value: string }>;
	placeholder: string;
	onValueChange: (value: string) => void;
} & ComponentProps<typeof Select>) => {
	const selectRef = useRef<ElementRef<typeof SelectTrigger>>(null);
	const control = useControl(meta);

	return (
		<div className="w-40">
			<select
				name={meta.name}
				defaultValue={meta.initialValue ?? ""}
				className="sr-only"
				ref={control.register}
				aria-hidden
				tabIndex={-1}
				onFocus={() => {
					selectRef.current?.focus();
				}}
			>
				<option value="" />
				{items.map((option) => (
					<option key={option.value} value={option.value} />
				))}
			</select>

			<Select
				{...props}
				value={control.value ?? ""}
				onValueChange={(value) => {
					control.change(value);
					onValueChange(value);
				}}
				onOpenChange={(open) => {
					if (!open) {
						control.blur();
					}
				}}
			>
				<SelectTrigger>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{items.map((item) => {
						return (
							<SelectItem key={item.value} value={item.value}>
								{item.name}
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
		</div>
	);
};

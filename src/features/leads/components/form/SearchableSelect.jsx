import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
	FieldLabel,
	FieldLoading,
	FieldMessage,
	fieldClassName,
} from "./formFieldStyles";

/**
 * Searchable combobox select.
 * options: [{ value, label, searchText?, disabled? }]
 * renderOption?(option, { selected }) for custom rows
 * renderValue?(option) for selected display
 */
const SearchableSelect = ({
	id,
	label,
	required = false,
	error,
	helperText,
	disabled = false,
	loading = false,
	value,
	onChange,
	options = [],
	placeholder = "Select...",
	searchPlaceholder = "Search...",
	emptyMessage = "No results",
	clearable = true,
	clearLabel = "None",
	searchable = true,
	placement = "bottom",
	renderOption,
	renderValue,
	className,
}) => {
	const autoId = useId();
	const listId = useId();
	const controlId = id ?? autoId;
	const containerRef = useRef(null);
	const searchRef = useRef(null);
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [highlight, setHighlight] = useState(0);

	const selected = useMemo(
		() => options.find((o) => String(o.value) === String(value)) ?? null,
		[options, value],
	);

	const filtered = useMemo(() => {
		if (!searchable) return options;
		const q = query.trim().toLowerCase();
		if (!q) return options;
		return options.filter((o) => {
			const hay = (o.searchText ?? o.label ?? "").toLowerCase();
			return hay.includes(q);
		});
	}, [options, query, searchable]);

	useEffect(() => {
		if (!open) return undefined;

		const handlePointerDown = (event) => {
			if (!containerRef.current?.contains(event.target)) {
				setOpen(false);
				setQuery("");
			}
		};

		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				event.preventDefault();
				setOpen(false);
				setQuery("");
			}
		};

		document.addEventListener("mousedown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [open]);

	useEffect(() => {
		if (open) {
			setHighlight(0);
			if (searchable) {
				requestAnimationFrame(() => searchRef.current?.focus());
			}
		}
	}, [open, searchable]);

	const selectOption = (option) => {
		if (option?.disabled) return;
		onChange?.(option?.value ?? "");
		setOpen(false);
		setQuery("");
	};

	const handleTriggerKeyDown = (event) => {
		if (disabled) return;
		if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
			event.preventDefault();
			setOpen(true);
		}
	};

	const handleListKeyDown = (event) => {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setHighlight((i) => Math.min(i + 1, filtered.length - 1));
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			setHighlight((i) => Math.max(i - 1, 0));
		} else if (event.key === "Enter") {
			event.preventDefault();
			const option = filtered[highlight];
			if (option) selectOption(option);
		}
	};

	if (loading) {
		return (
			<div>
				<FieldLabel htmlFor={controlId} label={label} required={required} />
				<FieldLoading />
			</div>
		);
	}

	const display = selected
		? (renderValue?.(selected) ?? selected.label)
		: (
			<span className="text-muted">{placeholder}</span>
		);

	return (
		<div ref={containerRef} className={`relative ${className ?? ""}`}>
			<FieldLabel htmlFor={controlId} label={label} required={required} />
			<button
				type="button"
				id={controlId}
				disabled={disabled}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={listId}
				aria-invalid={Boolean(error)}
				onClick={() => !disabled && setOpen((prev) => !prev)}
				onKeyDown={handleTriggerKeyDown}
				className={fieldClassName({
					error,
					className:
						"flex items-center justify-between gap-2 text-start focus-visible:ring-2 focus-visible:ring-accent/30",
				})}
			>
				<span className="min-w-0 flex-1 truncate">{display}</span>
				<ChevronsUpDown className="size-4 shrink-0 text-muted" aria-hidden="true" />
			</button>

			{open && (
				<div
					className={[
						"animate-dropdown-in absolute inset-x-0 z-50 overflow-hidden rounded-xl border border-border bg-surface shadow-lg",
						placement === "top"
							? "bottom-[calc(100%+0.35rem)]"
							: "top-[calc(100%+0.35rem)]",
					].join(" ")}
					onKeyDown={handleListKeyDown}
				>
					{searchable && (
						<div className="border-b border-border p-2">
							<label className="relative block">
								<span className="sr-only">{searchPlaceholder}</span>
								<Search
									className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted"
									aria-hidden="true"
								/>
								<input
									ref={searchRef}
									type="search"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder={searchPlaceholder}
									className="w-full rounded-lg border border-border bg-background py-2 pe-2 ps-8 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
								/>
							</label>
						</div>
					)}

					<ul
						id={listId}
						role="listbox"
						aria-label={label}
						className="max-h-56 overflow-y-auto py-1.5"
					>
						{clearable && (
							<li role="option" aria-selected={value === "" || value == null}>
								<button
									type="button"
									onClick={() => selectOption({ value: "" })}
									className={[
										"flex w-full items-center justify-between gap-2 px-3 py-2.5 text-start text-sm transition-colors",
										value === "" || value == null
											? "bg-light-gold/60 font-medium text-text"
											: "text-muted hover:bg-background hover:text-text",
									].join(" ")}
								>
									<span>{clearLabel}</span>
									{(value === "" || value == null) && (
										<Check className="size-4 text-gold" aria-hidden="true" />
									)}
								</button>
							</li>
						)}

						{filtered.length === 0 && (
							<li className="px-3 py-3 text-sm text-muted">{emptyMessage}</li>
						)}

						{filtered.map((option, index) => {
							const isSelected = String(option.value) === String(value);
							const isActive = index === highlight;
							return (
								<li
									key={String(option.value)}
									role="option"
									aria-selected={isSelected}
									aria-disabled={option.disabled}
								>
									<button
										type="button"
										disabled={option.disabled}
										onMouseEnter={() => setHighlight(index)}
										onClick={() => selectOption(option)}
										className={[
											"flex w-full items-center justify-between gap-2 px-3 py-2.5 text-start text-sm transition-colors",
											isSelected
												? "bg-light-gold/60 font-medium text-text"
												: isActive
													? "bg-background text-text"
													: "text-text hover:bg-background",
											option.disabled ? "opacity-50" : "",
										].join(" ")}
									>
										<span className="min-w-0 flex-1">
											{renderOption
												? renderOption(option, { selected: isSelected })
												: option.label}
										</span>
										{isSelected && (
											<Check className="size-4 shrink-0 text-gold" aria-hidden="true" />
										)}
									</button>
								</li>
							);
						})}
					</ul>
				</div>
			)}

			<FieldMessage error={error} helperText={helperText} />
		</div>
	);
};

export default SearchableSelect;

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

function normalizeValues(value) {
	if (Array.isArray(value)) return value.map(String).filter(Boolean);
	if (value == null || value === "") return [];
	return [String(value)];
}

function sameValues(a, b) {
	if (a.length !== b.length) return false;
	const set = new Set(a);
	return b.every((v) => set.has(v));
}

/**
 * Multi-select filter dropdown. `value` is a string[] of selected option values.
 */
const FilterMultiSelect = ({
	label,
	value = [],
	onChange,
	options,
	allLabel,
	placeholder,
	className = "",
	selectedCountLabel,
	clearValue = [],
}) => {
	const listId = useId();
	const ref = useRef(null);
	const [open, setOpen] = useState(false);
	const selectedValues = normalizeValues(value);
	const selectedSet = new Set(selectedValues);
	const clearedValues = normalizeValues(clearValue);
	const isCleared = sameValues(selectedValues, clearedValues);

	const display = (() => {
		if (isCleared) return allLabel;
		if (selectedValues.length === 1) {
			const match = options.find(
				(o) => String(o.value) === selectedValues[0],
			);
			return match?.label ?? selectedValues[0];
		}
		if (typeof selectedCountLabel === "function") {
			return selectedCountLabel(selectedValues.length);
		}
		return `${selectedValues.length} selected`;
	})();

	useEffect(() => {
		if (!open) return undefined;
		const handlePointer = (e) => {
			if (!ref.current?.contains(e.target)) setOpen(false);
		};
		const handleKey = (e) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", handlePointer);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handlePointer);
			document.removeEventListener("keydown", handleKey);
		};
	}, [open]);

	const toggleValue = (optionValue) => {
		const key = String(optionValue);
		const base = isCleared ? [] : selectedValues;
		const next = new Set(base);
		if (next.has(key)) next.delete(key);
		else next.add(key);
		const list = [...next];
		onChange(list.length > 0 ? list : clearedValues);
	};

	const clearAll = () => onChange(clearedValues);

	return (
		<div className={`relative w-full ${className}`} ref={ref}>
			{label && (
				<span className="mb-1.5 block text-xs font-medium text-muted">
					{label}
				</span>
			)}
			<button
				type="button"
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={listId}
				aria-label={placeholder ?? label}
				onClick={() => setOpen((p) => !p)}
				className={[
					"flex w-full items-center justify-between gap-2 rounded-xl border bg-surface py-2.5 pe-3 ps-3 text-start text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-accent/30",
					open
						? "border-accent ring-2 ring-accent/20"
						: "border-border hover:border-accent/50",
				].join(" ")}
			>
				<span
					className={`truncate ${isCleared ? "text-muted" : "text-text"}`}
				>
					{display}
				</span>
				<ChevronDown
					className={`size-4 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
					aria-hidden="true"
				/>
			</button>
			{open && (
				<ul
					id={listId}
					role="listbox"
					aria-multiselectable="true"
					className="animate-dropdown-in absolute inset-x-0 top-[calc(100%+0.35rem)] z-50 max-h-56 overflow-y-auto rounded-xl border border-border bg-surface py-1.5 shadow-lg"
				>
					<li role="option" aria-selected={isCleared}>
						<button
							type="button"
							onClick={clearAll}
							className={[
								"flex w-full items-center justify-between gap-2 px-3 py-2.5 text-start text-sm transition-colors",
								isCleared
									? "bg-light-gold/60 font-medium text-text"
									: "text-muted hover:bg-background hover:text-text",
							].join(" ")}
						>
							<span>{allLabel}</span>
							{isCleared && (
								<Check className="size-4 text-gold" aria-hidden="true" />
							)}
						</button>
					</li>
					{options.map((option) => {
						const selectedOpt =
							!isCleared && selectedSet.has(String(option.value));
						return (
							<li
								key={String(option.value)}
								role="option"
								aria-selected={selectedOpt}
							>
								<button
									type="button"
									onClick={() => toggleValue(option.value)}
									className={[
										"flex w-full items-center justify-between gap-2 px-3 py-2.5 text-start text-sm transition-colors",
										selectedOpt
											? "bg-light-gold/60 font-medium text-text"
											: "text-text hover:bg-background",
									].join(" ")}
								>
									<span className="truncate">{option.label}</span>
									{selectedOpt && (
										<Check
											className="size-4 shrink-0 text-gold"
											aria-hidden="true"
										/>
									)}
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};

export default FilterMultiSelect;

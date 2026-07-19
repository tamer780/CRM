import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
	FieldLabel,
	FieldLoading,
	FieldMessage,
} from "../../leads/components/form/formFieldStyles";

/**
 * Styled listbox select matching CRM filter dropdown look.
 * options: [{ value, label }]
 */
const CampaignSelect = ({
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
	clearable = true,
	clearLabel = "None",
	placement = "bottom",
	className = "",
}) => {
	const autoId = useId();
	const listId = useId();
	const selectId = id ?? autoId;
	const ref = useRef(null);
	const [open, setOpen] = useState(false);

	const selected = options.find((o) => String(o.value) === String(value));
	const display = selected ? selected.label : placeholder;
	const hasValue = value !== "" && value != null;

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

	if (loading) {
		return (
			<div className={className}>
				<FieldLabel htmlFor={selectId} label={label} required={required} />
				<FieldLoading />
			</div>
		);
	}

	return (
		<div className={`relative ${className}`} ref={ref}>
			<FieldLabel htmlFor={selectId} label={label} required={required} />
			<button
				type="button"
				id={selectId}
				disabled={disabled}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={listId}
				aria-invalid={Boolean(error)}
				aria-required={required}
				onClick={() => !disabled && setOpen((p) => !p)}
				className={[
					"flex w-full items-center justify-between gap-2 rounded-xl border bg-surface py-2.5 pe-3 ps-3 text-start text-sm shadow-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60",
					error
						? "border-red-400 ring-1 ring-red-100"
						: open
							? "border-accent ring-2 ring-accent/20"
							: "border-border hover:border-accent/50 focus-visible:ring-2 focus-visible:ring-accent/30",
				].join(" ")}
			>
				<span className={`truncate ${hasValue ? "text-text" : "text-muted"}`}>
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
					className={[
						"animate-dropdown-in absolute inset-x-0 z-50 max-h-56 overflow-y-auto rounded-xl border border-border bg-surface py-1.5 shadow-lg",
						placement === "top"
							? "bottom-[calc(100%+0.35rem)]"
							: "top-[calc(100%+0.35rem)]",
					].join(" ")}
				>
					{clearable && (
						<li role="option" aria-selected={!hasValue}>
							<button
								type="button"
								onClick={() => {
									onChange("");
									setOpen(false);
								}}
								className={[
									"flex w-full items-center justify-between gap-2 px-3 py-2.5 text-start text-sm transition-colors",
									!hasValue
										? "bg-light-gold/60 font-medium text-text"
										: "text-muted hover:bg-background hover:text-text",
								].join(" ")}
							>
								<span>{clearLabel}</span>
								{!hasValue && (
									<Check className="size-4 text-gold" aria-hidden="true" />
								)}
							</button>
						</li>
					)}
					{options.map((option) => {
						const selectedOpt = String(option.value) === String(value);
						return (
							<li
								key={String(option.value)}
								role="option"
								aria-selected={selectedOpt}
							>
								<button
									type="button"
									onClick={() => {
										onChange(option.value);
										setOpen(false);
									}}
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

			<FieldMessage error={error} helperText={helperText} />
		</div>
	);
};

export default CampaignSelect;

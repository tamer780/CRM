import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	LEAD_STATUS_DOT_COLORS,
	LEAD_STATUS_STYLES,
	LEAD_STATUS_ACTIONABLE,
} from "../../../utils/leads/leadConstants";

const STATUS_OPTIONS = LEAD_STATUS_ACTIONABLE;

function statusLabel(t, status) {
	const key = String(status ?? "").toLowerCase();
	return t(`leads.status.${key}`, {
		defaultValue: t(`dashboard.status.${key}`, {
			defaultValue: status ? String(status).replaceAll("_", " ") : "—",
		}),
	});
}

const LeadStatusSelect = ({
	status,
	onChange,
	disabled = false,
	isUpdating = false,
	placement = "bottom",
}) => {
	const { t } = useTranslation();
	const listId = useId();
	const ref = useRef(null);
	const [open, setOpen] = useState(false);

	const key = String(status ?? "").toLowerCase();
	const styles = LEAD_STATUS_STYLES[key] ?? "bg-background text-muted";
	const dot = LEAD_STATUS_DOT_COLORS[key] ?? "bg-muted";
	const label = statusLabel(t, status);
	const locked = disabled || isUpdating;

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

	const selectStatus = (next) => {
		setOpen(false);
		if (next === key || locked) return;
		onChange?.(next);
	};

	return (
		<div
			ref={ref}
			className="relative inline-flex"
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
		>
			<button
				type="button"
				disabled={locked}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={listId}
				aria-label={t("leads.columns.status")}
				title={t("leads.columns.status")}
				onClick={() => !locked && setOpen((prev) => !prev)}
				className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ring-black/5 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-60 ${styles}`}
			>
				<span className={`size-1.5 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
				{isUpdating ? t("common.loading") : label}
				<ChevronDown
					className={`size-3 shrink-0 opacity-70 transition-transform ${open ? "rotate-180" : ""}`}
					aria-hidden="true"
				/>
			</button>

			{open && (
				<ul
					id={listId}
					role="listbox"
					aria-label={t("leads.columns.status")}
					className={[
						"animate-dropdown-in absolute inset-s-0 z-50 max-h-56 min-w-44 overflow-y-auto rounded-xl border border-border bg-surface py-1.5 shadow-lg",
						placement === "top"
							? "bottom-[calc(100%+0.35rem)]"
							: "top-[calc(100%+0.35rem)]",
					].join(" ")}
				>
					{STATUS_OPTIONS.map((option) => {
						const selected = option === key;
						const optionDot =
							LEAD_STATUS_DOT_COLORS[option] ?? "bg-muted";
						return (
							<li key={option} role="option" aria-selected={selected}>
								<button
									type="button"
									onClick={() => selectStatus(option)}
									className={[
										"flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm capitalize transition-colors",
										selected
											? "bg-light-gold/60 font-medium text-text"
											: "text-text hover:bg-background",
									].join(" ")}
								>
									<span className="inline-flex items-center gap-2">
										<span
											className={`size-1.5 shrink-0 rounded-full ${optionDot}`}
											aria-hidden="true"
										/>
										{statusLabel(t, option)}
									</span>
									{selected && (
										<Check className="size-4 text-gold" aria-hidden="true" />
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

export default LeadStatusSelect;

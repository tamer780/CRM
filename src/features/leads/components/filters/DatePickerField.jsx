import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

function toYmd(date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function parseYmd(value) {
	if (!value || typeof value !== "string") return null;
	const [y, m, d] = value.split("-").map(Number);
	if (!y || !m || !d) return null;
	const date = new Date(y, m - 1, d);
	if (Number.isNaN(date.getTime())) return null;
	return date;
}

function formatDisplay(value, locale) {
	const date = parseYmd(value);
	if (!date) return "";
	return date.toLocaleDateString(locale, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function startOfMonth(date) {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildMonthDays(viewDate) {
	const year = viewDate.getFullYear();
	const month = viewDate.getMonth();
	const first = new Date(year, month, 1);
	const startPad = first.getDay(); // Sunday = 0
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const cells = [];

	for (let i = 0; i < startPad; i += 1) {
		cells.push(null);
	}
	for (let day = 1; day <= daysInMonth; day += 1) {
		cells.push(new Date(year, month, day));
	}
	while (cells.length % 7 !== 0) {
		cells.push(null);
	}
	return cells;
}

const DatePickerField = ({ value, onChange, ariaLabel, placeholder }) => {
	const { i18n, t } = useTranslation();
	const listId = useId();
	const ref = useRef(null);
	const [open, setOpen] = useState(false);
	const selected = parseYmd(value);
	const [viewDate, setViewDate] = useState(() =>
		startOfMonth(selected ?? new Date()),
	);

	const locale = i18n.language?.startsWith("ar") ? "ar" : "en";

	useEffect(() => {
		if (!open) return undefined;
		setViewDate(startOfMonth(selected ?? new Date()));
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
	}, [open, selected]);

	const weekdayLabels = useMemo(() => {
		const base = new Date(2024, 0, 7); // Sunday
		return Array.from({ length: 7 }, (_, i) => {
			const d = new Date(base);
			d.setDate(base.getDate() + i);
			return d.toLocaleDateString(locale, { weekday: "short" });
		});
	}, [locale]);

	const monthLabel = viewDate.toLocaleDateString(locale, {
		month: "long",
		year: "numeric",
	});

	const cells = useMemo(() => buildMonthDays(viewDate), [viewDate]);
	const todayYmd = toYmd(new Date());
	const selectedYmd = value || "";
	const display = value
		? formatDisplay(value, locale)
		: (placeholder ?? t("leads.filters.pickDate"));

	const shiftMonth = (delta) => {
		setViewDate(
			(prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1),
		);
	};

	return (
		<div className="relative min-w-[8rem] flex-1" ref={ref}>
			<button
				type="button"
				aria-haspopup="dialog"
				aria-expanded={open}
				aria-controls={listId}
				aria-label={ariaLabel}
				onClick={() => setOpen((p) => !p)}
				className={[
					"flex w-full items-center gap-2 rounded-xl border bg-surface py-2.5 pe-3 ps-3 text-start text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-accent/30",
					open
						? "border-accent ring-2 ring-accent/20"
						: "border-border hover:border-accent/50",
				].join(" ")}
			>
				<Calendar className="size-4 shrink-0 text-muted" aria-hidden="true" />
				<span className={`truncate ${value ? "text-text" : "text-muted"}`}>
					{display}
				</span>
			</button>

			{open && (
				<div
					id={listId}
					role="dialog"
					aria-label={ariaLabel}
					className="animate-dropdown-in absolute inset-x-0 top-[calc(100%+0.35rem)] z-50 w-full min-w-[17rem] rounded-xl border border-border bg-surface p-3 shadow-lg sm:min-w-[18rem]"
				>
					<div className="mb-2 flex items-center justify-between gap-2">
						<button
							type="button"
							onClick={() => shiftMonth(-1)}
							className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-text"
							aria-label={t("leads.filters.prevMonth")}
						>
							<ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
						</button>
						<span className="text-sm font-semibold text-text">{monthLabel}</span>
						<button
							type="button"
							onClick={() => shiftMonth(1)}
							className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-text"
							aria-label={t("leads.filters.nextMonth")}
						>
							<ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
						</button>
					</div>

					<div className="mb-1 grid grid-cols-7 gap-0.5">
						{weekdayLabels.map((day) => (
							<span
								key={day}
								className="py-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted"
							>
								{day}
							</span>
						))}
					</div>

					<div className="grid grid-cols-7 gap-0.5">
						{cells.map((date, index) => {
							if (!date) {
								return <span key={`empty-${index}`} className="size-8" />;
							}
							const ymd = toYmd(date);
							const isSelected = ymd === selectedYmd;
							const isToday = ymd === todayYmd;
							return (
								<button
									key={ymd}
									type="button"
									onClick={() => {
										onChange(ymd);
										setOpen(false);
									}}
									className={[
										"inline-flex size-8 items-center justify-center rounded-lg text-sm transition",
										isSelected
											? "bg-gold font-semibold text-primary shadow-sm"
											: isToday
												? "bg-light-gold/70 font-medium text-text hover:bg-light-gold"
												: "text-text hover:bg-background",
									].join(" ")}
								>
									{date.getDate()}
								</button>
							);
						})}
					</div>

					<div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2">
						<button
							type="button"
							onClick={() => {
								onChange("");
								setOpen(false);
							}}
							className="rounded-lg px-2 py-1 text-xs font-medium text-muted transition hover:bg-background hover:text-text"
						>
							{t("leads.filters.clearDate")}
						</button>
						<button
							type="button"
							onClick={() => {
								onChange(todayYmd);
								setOpen(false);
							}}
							className="rounded-lg px-2 py-1 text-xs font-medium text-accent transition hover:bg-background"
						>
							{t("leads.filters.today")}
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default DatePickerField;

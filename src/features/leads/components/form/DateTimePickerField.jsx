import { CalendarClock, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import {
	useEffect,
	useId,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

const MENU_GAP = 6;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

function pad(n) {
	return String(n).padStart(2, "0");
}

function toYmd(date) {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDatetimeLocal(value) {
	if (!value || typeof value !== "string") return null;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	return date;
}

function toDatetimeLocal(date) {
	return `${toYmd(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function snapMinute(minute) {
	const snapped = Math.round(minute / 5) * 5;
	return snapped === 60 ? 55 : snapped;
}

function startOfMonth(date) {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildMonthDays(viewDate) {
	const year = viewDate.getFullYear();
	const month = viewDate.getMonth();
	const first = new Date(year, month, 1);
	const startPad = first.getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const cells = [];

	for (let i = 0; i < startPad; i += 1) cells.push(null);
	for (let day = 1; day <= daysInMonth; day += 1) {
		cells.push(new Date(year, month, day));
	}
	while (cells.length % 7 !== 0) cells.push(null);
	return cells;
}

function formatDisplay(value, locale) {
	const date = parseDatetimeLocal(value);
	if (!date) return "";
	return date.toLocaleString(locale, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

/**
 * Custom datetime picker. Value format: `YYYY-MM-DDTHH:mm` (datetime-local).
 */
const DateTimePickerField = ({
	id,
	value,
	onChange,
	disabled = false,
	error = false,
	className = "",
	placeholder,
}) => {
	const { i18n, t } = useTranslation();
	const listId = useId();
	const triggerRef = useRef(null);
	const panelRef = useRef(null);
	const [open, setOpen] = useState(false);
	const [menuStyle, setMenuStyle] = useState(null);

	const selected = parseDatetimeLocal(value);
	const [viewDate, setViewDate] = useState(() =>
		startOfMonth(selected ?? new Date()),
	);
	const [draftDate, setDraftDate] = useState(() =>
		selected ? toYmd(selected) : "",
	);
	const [draftHour, setDraftHour] = useState(() =>
		selected ? selected.getHours() : 9,
	);
	const [draftMinute, setDraftMinute] = useState(() =>
		selected ? snapMinute(selected.getMinutes()) : 0,
	);

	const locale = i18n.language?.startsWith("ar") ? "ar" : "en";

	const syncDraftFromValue = () => {
		const next = parseDatetimeLocal(value);
		if (next) {
			setDraftDate(toYmd(next));
			setDraftHour(next.getHours());
			setDraftMinute(snapMinute(next.getMinutes()));
			setViewDate(startOfMonth(next));
			return;
		}
		const now = new Date();
		setDraftDate(toYmd(now));
		setDraftHour(now.getHours());
		setDraftMinute(snapMinute(now.getMinutes()));
		setViewDate(startOfMonth(now));
	};

	const updateMenuPosition = () => {
		const trigger = triggerRef.current;
		if (!trigger) return;
		const rect = trigger.getBoundingClientRect();
		const panelWidth = Math.min(Math.max(rect.width, 288), 340);
		const spaceBelow = window.innerHeight - rect.bottom;
		const spaceAbove = rect.top;
		const openUp = spaceBelow < 360 && spaceAbove > spaceBelow;
		const left = Math.min(
			Math.max(8, rect.left),
			window.innerWidth - panelWidth - 8,
		);

		const style = {
			position: "fixed",
			left,
			width: panelWidth,
			zIndex: 230,
		};

		if (openUp) {
			style.bottom = window.innerHeight - rect.top + MENU_GAP;
			style.top = "auto";
			style.maxHeight = Math.min(420, Math.max(spaceAbove - MENU_GAP, 260));
		} else {
			style.top = rect.bottom + MENU_GAP;
			style.bottom = "auto";
			style.maxHeight = Math.min(420, Math.max(spaceBelow - MENU_GAP, 260));
		}
		setMenuStyle(style);
	};

	useLayoutEffect(() => {
		if (!open) {
			setMenuStyle(null);
			return undefined;
		}
		updateMenuPosition();
		const handleReposition = () => updateMenuPosition();
		window.addEventListener("resize", handleReposition);
		window.addEventListener("scroll", handleReposition, true);
		return () => {
			window.removeEventListener("resize", handleReposition);
			window.removeEventListener("scroll", handleReposition, true);
		};
	}, [open]);

	useEffect(() => {
		if (!open) return undefined;
		syncDraftFromValue();

		const handlePointer = (event) => {
			const inTrigger = triggerRef.current?.contains(event.target);
			const inPanel = panelRef.current?.contains(event.target);
			if (!inTrigger && !inPanel) setOpen(false);
		};
		const handleKey = (event) => {
			if (event.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", handlePointer);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handlePointer);
			document.removeEventListener("keydown", handleKey);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- open sync only
	}, [open]);

	const weekdayLabels = useMemo(() => {
		const base = new Date(2024, 0, 7);
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
	const display = value
		? formatDisplay(value, locale)
		: (placeholder ?? t("leads.dateTime.placeholder"));

	const commit = (ymd, hour, minute) => {
		if (!ymd) {
			onChange?.("");
			return;
		}
		const [y, m, d] = ymd.split("-").map(Number);
		const next = new Date(y, m - 1, d, hour, minute, 0, 0);
		onChange?.(toDatetimeLocal(next));
	};

	const handleApply = () => {
		if (!draftDate) return;
		commit(draftDate, draftHour, draftMinute);
		setOpen(false);
	};

	const handleClear = () => {
		onChange?.("");
		setOpen(false);
	};

	const handleNow = () => {
		const now = new Date();
		const ymd = toYmd(now);
		const hour = now.getHours();
		const minute = snapMinute(now.getMinutes());
		setDraftDate(ymd);
		setDraftHour(hour);
		setDraftMinute(minute);
		setViewDate(startOfMonth(now));
		commit(ymd, hour, minute);
		setOpen(false);
	};

	const triggerClass = [
		"flex w-full items-center gap-2 rounded-xl border bg-background px-3 py-2.5 text-start text-sm outline-none transition",
		"focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/25",
		"disabled:cursor-not-allowed disabled:opacity-60",
		error
			? "border-red-400 ring-1 ring-red-100"
			: open
				? "border-gold ring-2 ring-gold/25"
				: "border-border/80 hover:border-gold/50",
		className,
	].join(" ");

	const timeChipClass = (active) =>
		[
			"inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold tabular-nums transition",
			active
				? "bg-gold text-primary shadow-sm"
				: "text-text hover:bg-background",
		].join(" ");

	const panel =
		open && menuStyle
			? createPortal(
					<div
						ref={panelRef}
						id={listId}
						role="dialog"
						aria-label={t("leads.dateTime.pickerLabel")}
						style={menuStyle}
						className="animate-dropdown-in overflow-auto rounded-2xl border border-border bg-surface p-3 shadow-xl"
					>
						<div className="mb-2 flex items-center justify-between gap-2">
							<button
								type="button"
								onClick={() =>
									setViewDate(
										(prev) =>
											new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
									)
								}
								className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-text"
								aria-label={t("leads.filters.prevMonth")}
							>
								<ChevronLeft
									className="size-4 rtl:rotate-180"
									aria-hidden="true"
								/>
							</button>
							<span className="text-sm font-semibold text-text">
								{monthLabel}
							</span>
							<button
								type="button"
								onClick={() =>
									setViewDate(
										(prev) =>
											new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
									)
								}
								className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-text"
								aria-label={t("leads.filters.nextMonth")}
							>
								<ChevronRight
									className="size-4 rtl:rotate-180"
									aria-hidden="true"
								/>
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
								const isSelected = ymd === draftDate;
								const isToday = ymd === todayYmd;
								return (
									<button
										key={ymd}
										type="button"
										onClick={() => setDraftDate(ymd)}
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

						<div className="mt-3 rounded-xl border border-border/80 bg-background/60 p-2.5">
							<div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
								<Clock className="size-3.5 text-gold" aria-hidden="true" />
								{t("leads.dateTime.time")}
							</div>
							<div className="grid grid-cols-2 gap-2">
								<div>
									<p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted">
										{t("leads.dateTime.hour")}
									</p>
									<div className="flex max-h-28 flex-wrap gap-1 overflow-y-auto rounded-lg border border-border/60 bg-surface p-1.5">
										{HOURS.map((hour) => (
											<button
												key={hour}
												type="button"
												onClick={() => setDraftHour(hour)}
												className={timeChipClass(draftHour === hour)}
											>
												{pad(hour)}
											</button>
										))}
									</div>
								</div>
								<div>
									<p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted">
										{t("leads.dateTime.minute")}
									</p>
									<div className="flex max-h-28 flex-wrap gap-1 overflow-y-auto rounded-lg border border-border/60 bg-surface p-1.5">
										{MINUTES.map((minute) => (
											<button
												key={minute}
												type="button"
												onClick={() => setDraftMinute(minute)}
												className={timeChipClass(draftMinute === minute)}
											>
												{pad(minute)}
											</button>
										))}
									</div>
								</div>
							</div>
						</div>

						<div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2.5">
							<div className="flex items-center gap-1">
								<button
									type="button"
									onClick={handleClear}
									className="rounded-lg px-2 py-1.5 text-xs font-medium text-muted transition hover:bg-background hover:text-text"
								>
									{t("leads.filters.clearDate")}
								</button>
								<button
									type="button"
									onClick={handleNow}
									className="rounded-lg px-2 py-1.5 text-xs font-medium text-accent transition hover:bg-background"
								>
									{t("leads.dateTime.now")}
								</button>
							</div>
							<button
								type="button"
								onClick={handleApply}
								disabled={!draftDate}
								className="rounded-xl bg-gold px-3 py-1.5 text-xs font-semibold text-primary shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{t("leads.dateTime.apply")}
							</button>
						</div>
					</div>,
					document.body,
				)
			: null;

	return (
		<div className="relative w-full">
			<button
				ref={triggerRef}
				id={id}
				type="button"
				disabled={disabled}
				aria-haspopup="dialog"
				aria-expanded={open}
				aria-controls={open ? listId : undefined}
				aria-invalid={error || undefined}
				onClick={() => {
					if (disabled) return;
					setOpen((prev) => !prev);
				}}
				className={triggerClass}
			>
				<CalendarClock
					className="size-4 shrink-0 text-gold"
					aria-hidden="true"
				/>
				<span
					className={`min-w-0 flex-1 truncate font-medium ${value ? "text-text" : "text-muted"}`}
				>
					{display}
				</span>
			</button>
			{panel}
		</div>
	);
};

export default DateTimePickerField;

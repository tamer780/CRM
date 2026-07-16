import { Check, ChevronDown, RotateCcw, Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LEAD_SOURCES } from "../../../utils/leads/leadConstants";
import { DUPLICATE_STATUSES } from "../utils/pendingLeadConstants";
import { hasActivePendingFilters } from "../utils/pendingLeadFilters";

function FilterDropdown({
	label,
	value,
	onChange,
	options,
	allLabel,
	placeholder,
	className = "",
}) {
	const listId = useId();
	const ref = useRef(null);
	const [open, setOpen] = useState(false);

	const selected = options.find((o) => String(o.value) === String(value));
	const display = selected ? selected.label : allLabel;

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

	return (
		<div
			className={`relative min-w-[9.5rem] flex-1 sm:flex-none sm:min-w-40 ${className}`}
			ref={ref}
		>
			{label && (
				<span className="mb-1 block text-xs font-medium text-muted">
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
				<span className={`truncate ${value ? "text-text" : "text-muted"}`}>
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
					className="animate-dropdown-in absolute inset-x-0 top-[calc(100%+0.35rem)] z-40 max-h-64 overflow-y-auto rounded-xl border border-border bg-surface py-1.5 shadow-lg"
				>
					<li role="option" aria-selected={!value}>
						<button
							type="button"
							onClick={() => {
								onChange("");
								setOpen(false);
							}}
							className={[
								"flex w-full items-center justify-between gap-2 px-3 py-2.5 text-start text-sm transition-colors",
								!value
									? "bg-light-gold/60 font-medium text-text"
									: "text-muted hover:bg-background hover:text-text",
							].join(" ")}
						>
							<span>{allLabel}</span>
							{!value && (
								<Check className="size-4 text-gold" aria-hidden="true" />
							)}
						</button>
					</li>
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
		</div>
	);
}

const PendingLeadsToolbar = ({
	filters,
	searchInput,
	onSearchInputChange,
	onFiltersChange,
	onReset,
	projects = [],
	campaigns = [],
}) => {
	const { t } = useTranslation();

	const set = (key, value) => onFiltersChange({ ...filters, [key]: value });

	const hasActive = hasActivePendingFilters({
		...filters,
		search: searchInput || filters.search,
	});

	const statusOpts = useMemo(
		() =>
			DUPLICATE_STATUSES.map((s) => ({
				value: s,
				label: t(`pendingLeads.status.${s}`),
			})),
		[t],
	);

	const sourceOpts = useMemo(
		() =>
			LEAD_SOURCES.map((s) => ({
				value: s,
				label: t(`leads.sources.${s}`),
			})),
		[t],
	);

	const projectOpts = useMemo(
		() =>
			projects.map((p) => ({
				value: p.id,
				label: p.name ?? p.title ?? `#${p.id}`,
			})),
		[projects],
	);

	const campaignOpts = useMemo(
		() =>
			campaigns.map((c) => ({
				value: c.id,
				label: c.name ?? c.title ?? `#${c.id}`,
			})),
		[campaigns],
	);

	return (
		<div className="sticky top-0 z-20 rounded-2xl border border-border bg-surface/95 px-3 py-3 shadow-sm backdrop-blur-sm sm:px-4">
			<div className="flex flex-wrap items-end gap-2 sm:gap-3">
				<label className="relative min-w-[12rem] flex-1 basis-full sm:basis-64">
					<span className="sr-only">
						{t("pendingLeads.searchPlaceholder")}
					</span>
					<Search
						className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted"
						aria-hidden="true"
					/>
					<input
						type="search"
						value={searchInput}
						onChange={(e) => onSearchInputChange(e.target.value)}
						placeholder={t("pendingLeads.searchPlaceholder")}
						className="w-full rounded-xl border border-border bg-surface py-2.5 pe-3 ps-10 text-sm text-text shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
					/>
				</label>

				<FilterDropdown
					label={t("pendingLeads.filters.duplicateStatus")}
					value={filters.status}
					onChange={(v) => set("status", v)}
					options={statusOpts}
					allLabel={t("pendingLeads.filters.allStatuses")}
					placeholder={t("pendingLeads.filters.duplicateStatus")}
				/>

				<FilterDropdown
					label={t("leads.form.source")}
					value={filters.source}
					onChange={(v) => set("source", v)}
					options={sourceOpts}
					allLabel={t("leads.form.none")}
					placeholder={t("leads.form.source")}
				/>

				<FilterDropdown
					label={t("leads.form.project")}
					value={filters.projectId}
					onChange={(v) => set("projectId", v)}
					options={projectOpts}
					allLabel={t("leads.form.none")}
					placeholder={t("leads.form.project")}
				/>

				<FilterDropdown
					label={t("leads.form.campaign")}
					value={filters.campaignId}
					onChange={(v) => set("campaignId", v)}
					options={campaignOpts}
					allLabel={t("leads.form.none")}
					placeholder={t("leads.form.campaign")}
				/>

				<div className="flex min-w-[12rem] flex-1 flex-wrap gap-2 sm:flex-none">
					<label className="min-w-[8rem] flex-1">
						<span className="mb-1 block text-xs font-medium text-muted">
							{t("pendingLeads.filters.dateFrom")}
						</span>
						<input
							type="date"
							value={filters.dateFrom}
							onChange={(e) => set("dateFrom", e.target.value)}
							className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
						/>
					</label>
					<label className="min-w-[8rem] flex-1">
						<span className="mb-1 block text-xs font-medium text-muted">
							{t("pendingLeads.filters.dateTo")}
						</span>
						<input
							type="date"
							value={filters.dateTo}
							onChange={(e) => set("dateTo", e.target.value)}
							className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
						/>
					</label>
				</div>

				{hasActive && (
					<button
						type="button"
						onClick={onReset}
						className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-medium text-muted shadow-sm transition hover:bg-background hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
					>
						<RotateCcw className="size-3.5" aria-hidden="true" />
						{t("pendingLeads.resetFilters")}
					</button>
				)}
			</div>
		</div>
	);
};

export default PendingLeadsToolbar;

import { Check, ChevronDown, RotateCcw } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LEAD_SOURCES } from "../../../utils/leads/leadConstants";
import { hasActiveReportFilters } from "../utils/reportFilters";

const dateInputClassName =
	"w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

function FilterDropdown({
	label,
	value,
	onChange,
	options,
	allLabel,
	placeholder,
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
		<div className="relative min-w-[9.5rem] flex-1 sm:flex-none sm:min-w-40" ref={ref}>
			{label && (
				<span className="mb-1 block text-xs font-medium text-muted">{label}</span>
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

const ReportsToolbar = ({
	filters,
	onFiltersChange,
	onReset,
	projects = [],
	campaigns = [],
	teams = [],
	users = [],
}) => {
	const { t } = useTranslation();
	const set = (key, value) => onFiltersChange({ ...filters, [key]: value });
	const hasActive = hasActiveReportFilters(filters);

	const projectOpts = useMemo(
		() =>
			projects.map((p) => ({
				value: p.id,
				label: p.name ?? `#${p.id}`,
			})),
		[projects],
	);

	const campaignOpts = useMemo(
		() =>
			campaigns.map((c) => ({
				value: c.id,
				label: c.name ?? `#${c.id}`,
			})),
		[campaigns],
	);

	const teamOpts = useMemo(
		() =>
			teams.map((team) => ({
				value: team.id,
				label: team.name ?? `#${team.id}`,
			})),
		[teams],
	);

	const userOpts = useMemo(
		() =>
			users.map((u) => ({
				value: u.id,
				label: u.name ?? u.email ?? `#${u.id}`,
			})),
		[users],
	);

	const sourceOpts = useMemo(
		() =>
			LEAD_SOURCES.map((source) => ({
				value: source,
				label: t(`leads.sources.${source}`, { defaultValue: source }),
			})),
		[t],
	);

	return (
		<div className="sticky top-0 z-20 rounded-2xl border border-border bg-surface/95 px-3 py-3 shadow-sm backdrop-blur-sm sm:px-4">
			<div className="flex flex-wrap items-end gap-2 sm:gap-3">
				<label className="min-w-36 flex-1 sm:max-w-44">
					<span className="mb-1 block text-xs font-medium text-muted">
						{t("reports.filters.dateFrom")}
					</span>
					<input
						type="date"
						value={filters.dateFrom}
						onChange={(e) => set("dateFrom", e.target.value)}
						className={dateInputClassName}
					/>
				</label>
				<label className="min-w-36 flex-1 sm:max-w-44">
					<span className="mb-1 block text-xs font-medium text-muted">
						{t("reports.filters.dateTo")}
					</span>
					<input
						type="date"
						value={filters.dateTo}
						onChange={(e) => set("dateTo", e.target.value)}
						className={dateInputClassName}
					/>
				</label>

				<FilterDropdown
					label={t("reports.filters.project")}
					value={filters.projectId}
					onChange={(v) => set("projectId", v)}
					options={projectOpts}
					allLabel={t("reports.filters.allProjects")}
					placeholder={t("reports.filters.project")}
				/>

				<FilterDropdown
					label={t("reports.filters.campaign")}
					value={filters.campaignId}
					onChange={(v) => set("campaignId", v)}
					options={campaignOpts}
					allLabel={t("reports.filters.allCampaigns")}
					placeholder={t("reports.filters.campaign")}
				/>

				<FilterDropdown
					label={t("reports.filters.team")}
					value={filters.teamId}
					onChange={(v) => set("teamId", v)}
					options={teamOpts}
					allLabel={t("reports.filters.allTeams")}
					placeholder={t("reports.filters.team")}
				/>

				<FilterDropdown
					label={t("reports.filters.user")}
					value={filters.userId}
					onChange={(v) => set("userId", v)}
					options={userOpts}
					allLabel={t("reports.filters.allUsers")}
					placeholder={t("reports.filters.user")}
				/>

				<FilterDropdown
					label={t("reports.filters.source")}
					value={filters.source}
					onChange={(v) => set("source", v)}
					options={sourceOpts}
					allLabel={t("reports.filters.allSources")}
					placeholder={t("reports.filters.source")}
				/>

				{hasActive && (
					<button
						type="button"
						onClick={onReset}
						className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-medium text-muted shadow-sm transition hover:bg-background hover:text-text"
					>
						<RotateCcw className="size-3.5" aria-hidden="true" />
						{t("reports.resetFilters")}
					</button>
				)}
			</div>
		</div>
	);
};

export default ReportsToolbar;

import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

function formatPeriodDate(value) {
	if (!value) return "—";
	const date = new Date(`${value}T00:00:00`);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

const dateInputClassName =
	"w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

const KpiHeader = ({
	dateFrom,
	dateTo,
	onDateFromChange,
	onDateToChange,
	onRefresh,
	isRefreshing,
}) => {
	const { t } = useTranslation();
	const from = formatPeriodDate(dateFrom);
	const to = formatPeriodDate(dateTo);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
						{t("kpi.title")}
					</h1>
					<p className="mt-1.5 text-muted">{t("kpi.subtitle")}</p>
					{dateFrom && dateTo && (
						<p className="mt-2 text-sm text-muted">
							{t("kpi.reportingPeriod")}:{" "}
							<span className="font-medium text-text">
								{t("kpi.periodRange", { from, to })}
							</span>
						</p>
					)}
				</div>

				<button
					type="button"
					onClick={onRefresh}
					disabled={isRefreshing || !dateFrom || !dateTo}
					className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text shadow-sm transition-all hover:bg-background disabled:opacity-60"
				>
					<RefreshCw
						className={`size-4 text-muted ${isRefreshing ? "animate-spin" : ""}`}
						aria-hidden="true"
					/>
					{t("kpi.refresh")}
				</button>
			</div>

			<div className="flex flex-wrap gap-3">
				<label className="min-w-40 flex-1 sm:max-w-56">
					<span className="mb-1 block text-xs font-medium text-muted">
						{t("kpi.dateFrom")}
					</span>
					<input
						type="date"
						value={dateFrom}
						onChange={(e) => onDateFromChange(e.target.value)}
						className={dateInputClassName}
					/>
				</label>
				<label className="min-w-40 flex-1 sm:max-w-56">
					<span className="mb-1 block text-xs font-medium text-muted">
						{t("kpi.dateTo")}
					</span>
					<input
						type="date"
						value={dateTo}
						onChange={(e) => onDateToChange(e.target.value)}
						className={dateInputClassName}
					/>
				</label>
			</div>
		</div>
	);
};

export default KpiHeader;

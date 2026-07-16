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

const ReportsHeader = ({
	dateFrom,
	dateTo,
	isRefreshing,
	onRefresh,
}) => {
	const { t } = useTranslation();
	const from = formatPeriodDate(dateFrom);
	const to = formatPeriodDate(dateTo);

	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div className="min-w-0">
				<h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
					{t("reports.title")}
				</h1>
				<p className="mt-1.5 text-muted">{t("reports.subtitle")}</p>
				{dateFrom && dateTo && (
					<p className="mt-2 text-sm text-muted">
						{t("reports.reportingPeriod")}:{" "}
						<span className="font-medium text-text">
							{t("reports.periodRange", { from, to })}
						</span>
					</p>
				)}
			</div>

			<button
				type="button"
				onClick={onRefresh}
				disabled={isRefreshing}
				className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text shadow-sm transition hover:bg-background disabled:opacity-60"
			>
				<RefreshCw
					className={`size-4 text-muted ${isRefreshing ? "animate-spin" : ""}`}
					aria-hidden="true"
				/>
				{t("reports.refresh")}
			</button>
		</div>
	);
};

export default ReportsHeader;

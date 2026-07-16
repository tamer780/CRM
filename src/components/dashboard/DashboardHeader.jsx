import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

function greetingKey(now = new Date()) {
	const hour = now.getHours();
	if (hour < 12) return "dashboard.greeting.morning";
	if (hour < 17) return "dashboard.greeting.afternoon";
	return "dashboard.greeting.evening";
}

function formatFullDate(date, locale) {
	return date.toLocaleDateString(locale, {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function formatPeriodDate(value) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

const DashboardHeader = ({
	name,
	variant = "manager",
	period,
	showPeriod = false,
	onRefresh,
	isRefreshing,
}) => {
	const { t, i18n } = useTranslation();
	const now = new Date();
	const from = formatPeriodDate(period?.from);
	const to = formatPeriodDate(period?.to);

	return (
		<motion.header
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35 }}
			className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
		>
			<div className="min-w-0">
				<p className="text-sm font-medium text-muted">
					{formatFullDate(now, i18n.language)}
				</p>
				<h1 className="mt-1 text-[36px] font-semibold leading-tight tracking-tight text-text sm:text-[40px]">
					{t(greetingKey(now), { name: name || t("common.user") })}
				</h1>
				<p className="mt-2 text-base text-muted">
					{t(
						variant === "sales"
							? "dashboard.subtitleSales"
							: "dashboard.subtitle",
					)}
				</p>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				{showPeriod && period?.from && period?.to && (
					<div className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-muted shadow-sm">
						<span className="font-medium text-text">
							{t("dashboard.reportingPeriod")}
						</span>
						<span className="ms-2">
							{t("dashboard.periodRange", { from, to })}
						</span>
					</div>
				)}
				<button
					type="button"
					onClick={onRefresh}
					disabled={isRefreshing}
					className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-secondary disabled:opacity-60"
					aria-label={t("dashboard.refresh")}
				>
					<RefreshCw
						className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
						aria-hidden="true"
					/>
					{t("dashboard.refresh")}
				</button>
			</div>
		</motion.header>
	);
};

export default DashboardHeader;

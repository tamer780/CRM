import { Percent, Target, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import ErrorState from "./ErrorState";
import LoadingSkeleton from "./LoadingSkeleton";
import StatsCard from "./StatsCard";

function averageRate(teams, key) {
	if (!Array.isArray(teams) || teams.length === 0) return 0;
	const sum = teams.reduce((acc, team) => acc + (Number(team?.[key]) || 0), 0);
	return sum / teams.length;
}

function formatRate(value) {
	const rate = Number(value) || 0;
	return `${Number.isInteger(rate) ? rate : rate.toFixed(1)}%`;
}

const DashboardStats = ({ data, isLoading, isError, onRetry }) => {
	const { t } = useTranslation();

	if (isLoading) {
		return (
			<section className="space-y-3">
				<div>
					<h2 className="text-lg font-semibold tracking-tight text-text">
						{t("dashboard.stats.periodTitle")}
					</h2>
					<p className="mt-1 text-sm text-muted">
						{t("dashboard.stats.periodSubtitle")}
					</p>
				</div>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					{Array.from({ length: 3 }).map((_, index) => (
						<LoadingSkeleton key={index} variant="card" />
					))}
				</div>
			</section>
		);
	}

	if (isError) {
		return (
			<div className="rounded-2xl border border-border bg-surface shadow-sm">
				<ErrorState onRetry={onRetry} />
			</div>
		);
	}

	const teams = data?.teams ?? [];
	const cards = [
		{
			title: t("dashboard.stats.totalLeads"),
			value: data?.leads ?? 0,
			description: t("dashboard.stats.totalLeadsDesc"),
			icon: UserPlus,
		},
		{
			title: t("dashboard.stats.avgContactRate"),
			value: formatRate(averageRate(teams, "contact_rate")),
			description: t("dashboard.stats.avgContactRateDesc"),
			icon: Percent,
		},
		{
			title: t("dashboard.stats.avgConversionRate"),
			value: formatRate(averageRate(teams, "conversion_rate")),
			description: t("dashboard.stats.avgConversionRateDesc"),
			icon: Target,
		},
	];

	return (
		<section className="space-y-3">
			<div>
				<h2 className="text-lg font-semibold tracking-tight text-text">
					{t("dashboard.stats.periodTitle")}
				</h2>
				<p className="mt-1 text-sm text-muted">
					{t("dashboard.stats.periodSubtitle")}
				</p>
			</div>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{cards.map((card) => (
					<StatsCard key={card.title} {...card} />
				))}
			</div>
		</section>
	);
};

export default DashboardStats;

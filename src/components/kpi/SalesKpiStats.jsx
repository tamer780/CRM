import {
	CheckCircle2,
	MessageCircle,
	Percent,
	Target,
	UserCheck,
	UserPlus,
	Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ErrorState from "../dashboard/ErrorState";
import LoadingSkeleton from "../dashboard/LoadingSkeleton";
import StatsCard from "../dashboard/StatsCard";

function formatRate(value) {
	const rate = Number(value) || 0;
	return `${Number.isInteger(rate) ? rate : rate.toFixed(1)}%`;
}

const SalesKpiStats = ({ data, isLoading, isError, onRetry, hasPeriod }) => {
	const { t } = useTranslation();

	if (!hasPeriod) {
		return (
			<div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted shadow-sm">
				{t("kpi.selectDates")}
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{Array.from({ length: 7 }).map((_, index) => (
					<LoadingSkeleton key={index} variant="card" />
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<div className="rounded-2xl border border-border bg-surface shadow-sm">
				<ErrorState onRetry={onRetry} />
			</div>
		);
	}

	const cards = [
		{
			title: t("kpi.sales.totalAssigned"),
			value: data?.total_assigned ?? 0,
			description: t("kpi.sales.totalAssignedDesc"),
			icon: Users,
		},
		{
			title: t("kpi.sales.contacted"),
			value: data?.contacted ?? 0,
			description: t("kpi.sales.contactedDesc"),
			icon: MessageCircle,
		},
		{
			title: t("kpi.sales.qualified"),
			value: data?.qualified ?? 0,
			description: t("kpi.sales.qualifiedDesc"),
			icon: UserCheck,
		},
		{
			title: t("kpi.sales.converted"),
			value: data?.converted ?? 0,
			description: t("kpi.sales.convertedDesc"),
			icon: CheckCircle2,
		},
		{
			title: t("kpi.sales.contactRate"),
			value: formatRate(data?.contact_rate),
			description: t("kpi.sales.contactRateDesc"),
			icon: Percent,
		},
		{
			title: t("kpi.sales.qualificationRate"),
			value: formatRate(data?.qualification_rate),
			description: t("kpi.sales.qualificationRateDesc"),
			icon: Target,
		},
		{
			title: t("kpi.sales.conversionRate"),
			value: formatRate(data?.conversion_rate),
			description: t("kpi.sales.conversionRateDesc"),
			icon: UserPlus,
		},
	];

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{cards.map((card) => (
				<StatsCard key={card.title} {...card} />
			))}
		</div>
	);
};

export default SalesKpiStats;

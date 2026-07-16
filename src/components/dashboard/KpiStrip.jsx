import {
	Percent,
	Target,
	UserCheck,
	UserPlus,
	Users,
	Trophy,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import LoadingSkeleton from "./LoadingSkeleton";

function formatRate(value) {
	if (value == null || Number.isNaN(Number(value))) return "—";
	const rate = Number(value);
	return `${Number.isInteger(rate) ? rate : rate.toFixed(1)}%`;
}

const iconWrap = "flex size-11 items-center justify-center rounded-full";

const KpiStrip = ({ metrics, isLoading }) => {
	const { t } = useTranslation();

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
				{Array.from({ length: 6 }).map((_, index) => (
					<LoadingSkeleton key={index} variant="card" />
				))}
			</div>
		);
	}

	const cards = [
		{
			key: "totalLeads",
			label: t("dashboard.kpiStrip.totalLeads"),
			value: metrics?.totalLeads ?? 0,
			icon: Users,
			iconBg: "bg-primary/10 text-primary",
		},
		{
			key: "newToday",
			label: t("dashboard.kpiStrip.newToday"),
			value: metrics?.newToday ?? 0,
			icon: UserPlus,
			iconBg: "bg-accent/15 text-accent",
		},
		{
			key: "qualified",
			label: t("dashboard.kpiStrip.qualified"),
			value: metrics?.qualified ?? 0,
			icon: UserCheck,
			iconBg: "bg-success/10 text-success",
		},
		{
			key: "converted",
			label: t("dashboard.kpiStrip.converted"),
			value: metrics?.converted ?? 0,
			icon: Trophy,
			iconBg: "bg-gold/15 text-gold",
		},
		{
			key: "contactRate",
			label: t("dashboard.kpiStrip.contactRate"),
			value: formatRate(metrics?.contactRate),
			icon: Percent,
			iconBg: "bg-secondary/10 text-secondary",
		},
		{
			key: "conversionRate",
			label: t("dashboard.kpiStrip.conversionRate"),
			value: formatRate(metrics?.conversionRate),
			icon: Target,
			iconBg: "bg-warning/10 text-warning",
		},
	];

	return (
		<section className="space-y-3">
			<div>
				<h2 className="text-[22px] font-semibold tracking-tight text-text">
					{t("dashboard.kpiStrip.title")}
				</h2>
				<p className="mt-1 text-sm text-muted">
					{t("dashboard.kpiStrip.subtitle")}
				</p>
			</div>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
				{cards.map((card, index) => {
					const Icon = card.icon;
					return (
						<motion.div
							key={card.key}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.04 * index }}
							whileHover={{ y: -3 }}
							className="rounded-xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<p className="text-3xl font-semibold tracking-tight text-text">
										{card.value}
									</p>
									<p className="mt-2 text-sm font-medium text-muted">
										{card.label}
									</p>
								</div>
								<div className={`${iconWrap} ${card.iconBg}`}>
									<Icon className="size-5" aria-hidden="true" />
								</div>
							</div>
						</motion.div>
					);
				})}
			</div>
		</section>
	);
};

export default KpiStrip;

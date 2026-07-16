import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingSkeleton from "./LoadingSkeleton";

const CHART_COLORS = ["#1B3C53", "#234C6A", "#456882", "#C8A96A", "#22C55E", "#F59E0B"];

const ChartCard = ({ title, subtitle, children }) => (
	<div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
		<h3 className="text-base font-semibold text-text">{title}</h3>
		{subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
		<div className="mt-4 h-56 w-full">{children}</div>
	</div>
);

const AnalyticsSection = ({
	leadGrowth,
	sourceReports,
	campaignReports,
	isLoading,
	isError,
	onRetry,
}) => {
	const { t } = useTranslation();

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
				{Array.from({ length: 4 }).map((_, i) => (
					<LoadingSkeleton key={i} variant="table" />
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<section className="rounded-xl border border-border bg-surface shadow-sm">
				<ErrorState onRetry={onRetry} />
			</section>
		);
	}

	const sources = (sourceReports ?? []).map((row) => ({
		name: row.source ?? row.name ?? "—",
		leads: Number(row.leads) || 0,
		converted: Number(row.converted) || 0,
	}));

	const campaigns = (campaignReports ?? []).slice(0, 8).map((row) => ({
		name: row.name ?? "—",
		revenue: Number(row.revenue) || 0,
		spent: Number(row.spent) || 0,
		leads: Number(row.leads) || 0,
	}));

	const hasGrowth = (leadGrowth ?? []).some((d) => d.count > 0);
	const hasSources = sources.some((d) => d.leads > 0);
	const hasCampaigns = campaigns.some((d) => d.revenue > 0 || d.spent > 0 || d.leads > 0);
	const conversionBySource = sources.filter((d) => d.leads > 0);

	if (!hasGrowth && !hasSources && !hasCampaigns) {
		return (
			<section className="rounded-xl border border-border bg-surface shadow-sm">
				<EmptyState
					icon={BarChart3}
					title={t("dashboard.analytics.emptyTitle")}
					message={t("dashboard.analytics.emptyMessage")}
				/>
			</section>
		);
	}

	return (
		<section className="space-y-3">
			<div>
				<h2 className="text-[22px] font-semibold tracking-tight text-text">
					{t("dashboard.analytics.title")}
				</h2>
				<p className="mt-1 text-sm text-muted">
					{t("dashboard.analytics.subtitle")}
				</p>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="grid grid-cols-1 gap-4 xl:grid-cols-2"
			>
				<ChartCard
					title={t("dashboard.analytics.leadGrowth")}
					subtitle={t("dashboard.analytics.leadGrowthDesc")}
				>
					{hasGrowth ? (
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={leadGrowth}>
								<CartesianGrid strokeDasharray="3 3" stroke="#E8EBF0" />
								<XAxis dataKey="label" tick={{ fontSize: 11 }} />
								<YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
								<Tooltip />
								<Bar dataKey="count" fill="#1B3C53" radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					) : (
						<p className="flex h-full items-center justify-center text-sm text-muted">
							{t("dashboard.analytics.noData")}
						</p>
					)}
				</ChartCard>

				<ChartCard
					title={t("dashboard.analytics.leadSources")}
					subtitle={t("dashboard.analytics.leadSourcesDesc")}
				>
					{hasSources ? (
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={sources}
									dataKey="leads"
									nameKey="name"
									innerRadius={50}
									outerRadius={80}
									paddingAngle={2}
								>
									{sources.map((_, i) => (
										<Cell
											key={i}
											fill={CHART_COLORS[i % CHART_COLORS.length]}
										/>
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					) : (
						<p className="flex h-full items-center justify-center text-sm text-muted">
							{t("dashboard.analytics.noData")}
						</p>
					)}
				</ChartCard>

				<ChartCard
					title={t("dashboard.analytics.campaignRevenue")}
					subtitle={t("dashboard.analytics.campaignRevenueDesc")}
				>
					{hasCampaigns ? (
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={campaigns}>
								<CartesianGrid strokeDasharray="3 3" stroke="#E8EBF0" />
								<XAxis dataKey="name" hide />
								<YAxis tick={{ fontSize: 11 }} />
								<Tooltip />
								<Bar dataKey="revenue" fill="#C8A96A" radius={[6, 6, 0, 0]} />
								<Bar dataKey="spent" fill="#456882" radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					) : (
						<p className="flex h-full items-center justify-center text-sm text-muted">
							{t("dashboard.analytics.noData")}
						</p>
					)}
				</ChartCard>

				<ChartCard
					title={t("dashboard.analytics.sourceConversion")}
					subtitle={t("dashboard.analytics.sourceConversionDesc")}
				>
					{conversionBySource.length ? (
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={conversionBySource}>
								<CartesianGrid strokeDasharray="3 3" stroke="#E8EBF0" />
								<XAxis dataKey="name" tick={{ fontSize: 10 }} />
								<YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
								<Tooltip />
								<Bar dataKey="leads" fill="#234C6A" radius={[6, 6, 0, 0]} />
								<Bar dataKey="converted" fill="#22C55E" radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					) : (
						<p className="flex h-full items-center justify-center text-sm text-muted">
							{t("dashboard.analytics.noData")}
						</p>
					)}
				</ChartCard>
			</motion.div>
		</section>
	);
};

export default AnalyticsSection;

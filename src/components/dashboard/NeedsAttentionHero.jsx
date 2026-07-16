import {
	AlertTriangle,
	ArrowRight,
	CalendarClock,
	ClipboardList,
	UserRoundX,
	Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import LoadingSkeleton from "./LoadingSkeleton";

function buildMetrics({ variant, summary, userId }) {
	if (variant === "sales") {
		const assignedParam = userId != null ? `&assigned=${userId}` : "";
		return [
			{
				key: "overdue",
				labelKey: "dashboard.attention.overdue",
				value: summary.overdue,
				to: `/scheduled-actions?status=pending${assignedParam}`,
				icon: AlertTriangle,
				tone: "danger",
			},
			{
				key: "dueToday",
				labelKey: "dashboard.attention.dueToday",
				value: summary.dueToday,
				to: `/scheduled-actions?status=pending${assignedParam}`,
				icon: CalendarClock,
				tone: "warning",
			},
			{
				key: "myAssigned",
				labelKey: "dashboard.attention.myAssigned",
				value: summary.myAssigned,
				to: "/leads",
				icon: Users,
				tone: "neutral",
			},
		];
	}

	return [
		{
			key: "overdue",
			labelKey: "dashboard.attention.overdue",
			value: summary.overdue,
			to: "/scheduled-actions?status=pending",
			icon: AlertTriangle,
			tone: "danger",
		},
		{
			key: "dueToday",
			labelKey: "dashboard.attention.dueToday",
			value: summary.dueToday,
			to: "/scheduled-actions?status=pending",
			icon: CalendarClock,
			tone: "warning",
		},
		{
			key: "unassigned",
			labelKey: "dashboard.attention.unassigned",
			value: summary.unassigned,
			to: "/leads",
			icon: UserRoundX,
			tone: "warning",
		},
		{
			key: "pendingDuplicates",
			labelKey: "dashboard.attention.pendingDuplicates",
			value: summary.pendingDuplicates,
			to: "/pending-leads?status=pending",
			icon: ClipboardList,
			tone: "neutral",
		},
	];
}

const toneStyles = {
	danger: "bg-danger/10 text-danger",
	warning: "bg-warning/10 text-warning",
	neutral: "bg-primary/10 text-primary",
};

const NeedsAttentionHero = ({
	variant = "manager",
	summary,
	userId,
	isLoading,
}) => {
	const { t } = useTranslation();

	if (isLoading) {
		return <LoadingSkeleton variant="hero" />;
	}

	const metrics = buildMetrics({
		variant,
		summary: summary ?? {
			overdue: 0,
			dueToday: 0,
			unassigned: 0,
			pendingDuplicates: 0,
			myAssigned: 0,
		},
		userId,
	});

	const urgentTotal =
		(summary?.overdue ?? 0) +
		(summary?.dueToday ?? 0) +
		(variant === "manager" ? (summary?.unassigned ?? 0) : 0);

	const primaryCta =
		variant === "manager"
			? {
					to: "/scheduled-actions?status=pending",
					label: t("dashboard.hero.openQueue"),
				}
			: {
					to:
						userId != null
							? `/scheduled-actions?status=pending&assigned=${userId}`
							: "/scheduled-actions?status=pending",
					label: t("dashboard.hero.openQueue"),
				};

	const secondaryCta =
		variant === "manager"
			? {
					to: "/pending-leads?status=pending",
					label: t("dashboard.hero.reviewNow"),
				}
			: {
					to: "/leads",
					label: t("dashboard.hero.viewLeads"),
				};

	return (
		<motion.section
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: 0.05 }}
			className={[
				"relative overflow-hidden rounded-2xl border bg-surface p-6 shadow-sm sm:p-8",
				urgentTotal > 0
					? "border-warning/40 bg-gradient-to-br from-warning/5 via-surface to-surface"
					: "border-border",
			].join(" ")}
		>
			<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
				<div className="max-w-xl">
					<p className="text-sm font-semibold uppercase tracking-wide text-warning">
						{t("dashboard.hero.eyebrow")}
					</p>
					<h2 className="mt-2 text-[22px] font-semibold tracking-tight text-text sm:text-2xl">
						{t("dashboard.attention.title")}
					</h2>
					<p className="mt-2 text-sm text-muted sm:text-base">
						{t(
							variant === "sales"
								? "dashboard.attention.subtitleSales"
								: "dashboard.attention.subtitle",
						)}
					</p>
					<div className="mt-5 flex flex-wrap gap-3">
						<Link
							to={primaryCta.to}
							className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-secondary"
						>
							{primaryCta.label}
							<ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
						</Link>
						<Link
							to={secondaryCta.to}
							className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text shadow-sm transition-all hover:border-gold/50 hover:text-primary"
						>
							{secondaryCta.label}
						</Link>
					</div>
				</div>

				<div
					className={[
						"grid flex-1 gap-3 sm:grid-cols-2",
						metrics.length > 3 ? "xl:grid-cols-4" : "xl:grid-cols-3",
					].join(" ")}
				>
					{metrics.map((metric) => {
						const Icon = metric.icon;
						const hot = metric.value > 0 && metric.tone !== "neutral";
						return (
							<Link
								key={metric.key}
								to={metric.to}
								className={[
									"rounded-xl border bg-surface/90 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
									hot ? "border-warning/30" : "border-border",
								].join(" ")}
							>
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="text-xs font-medium text-muted">
											{t(metric.labelKey)}
										</p>
										<p className="mt-2 text-3xl font-semibold tracking-tight text-text">
											{metric.value}
										</p>
									</div>
									<div
										className={`flex size-10 items-center justify-center rounded-full ${toneStyles[metric.tone]}`}
									>
										<Icon className="size-5" aria-hidden="true" />
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</motion.section>
	);
};

export default NeedsAttentionHero;

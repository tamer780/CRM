import {
	AlertTriangle,
	CalendarClock,
	ClipboardList,
	UserRoundX,
	Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import LoadingSkeleton from "./LoadingSkeleton";

function buildCards({ variant, summary, userId }) {
	if (variant === "sales") {
		const assignedParam = userId != null ? `&assigned=${userId}` : "";
		return [
			{
				key: "overdue",
				titleKey: "dashboard.attention.overdue",
				descKey: "dashboard.attention.overdueDescSales",
				value: summary.overdue,
				to: `/scheduled-actions?status=pending${assignedParam}`,
				icon: AlertTriangle,
				urgent: summary.overdue > 0,
			},
			{
				key: "dueToday",
				titleKey: "dashboard.attention.dueToday",
				descKey: "dashboard.attention.dueTodayDescSales",
				value: summary.dueToday,
				to: `/scheduled-actions?status=pending${assignedParam}`,
				icon: CalendarClock,
				urgent: summary.dueToday > 0,
			},
			{
				key: "myAssigned",
				titleKey: "dashboard.attention.myAssigned",
				descKey: "dashboard.attention.myAssignedDesc",
				value: summary.myAssigned,
				to: "/leads",
				icon: Users,
				urgent: false,
			},
		];
	}

	return [
		{
			key: "overdue",
			titleKey: "dashboard.attention.overdue",
			descKey: "dashboard.attention.overdueDesc",
			value: summary.overdue,
			to: "/scheduled-actions?status=pending",
			icon: AlertTriangle,
			urgent: summary.overdue > 0,
		},
		{
			key: "dueToday",
			titleKey: "dashboard.attention.dueToday",
			descKey: "dashboard.attention.dueTodayDesc",
			value: summary.dueToday,
			to: "/scheduled-actions?status=pending",
			icon: CalendarClock,
			urgent: summary.dueToday > 0,
		},
		{
			key: "unassigned",
			titleKey: "dashboard.attention.unassigned",
			descKey: "dashboard.attention.unassignedDesc",
			value: summary.unassigned,
			to: "/leads",
			icon: UserRoundX,
			urgent: summary.unassigned > 0,
		},
		{
			key: "pendingDuplicates",
			titleKey: "dashboard.attention.pendingDuplicates",
			descKey: "dashboard.attention.pendingDuplicatesDesc",
			value: summary.pendingDuplicates,
			to: "/pending-leads?status=pending",
			icon: ClipboardList,
			urgent: summary.pendingDuplicates > 0,
		},
	];
}

const NeedsAttentionCards = ({
	variant = "manager",
	summary,
	userId,
	isLoading,
}) => {
	const { t } = useTranslation();

	if (isLoading) {
		const count = variant === "sales" ? 3 : 4;
		return (
			<div
				className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
					variant === "sales" ? "xl:grid-cols-3" : "xl:grid-cols-4"
				}`}
			>
				{Array.from({ length: count }).map((_, index) => (
					<LoadingSkeleton key={index} variant="card" />
				))}
			</div>
		);
	}

	const cards = buildCards({
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

	return (
		<section className="space-y-3">
			<div>
				<h2 className="text-lg font-semibold tracking-tight text-text">
					{t("dashboard.attention.title")}
				</h2>
				<p className="mt-1 text-sm text-muted">
					{t(
						variant === "sales"
							? "dashboard.attention.subtitleSales"
							: "dashboard.attention.subtitle",
					)}
				</p>
			</div>

			<div
				className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
					variant === "sales" ? "xl:grid-cols-3" : "xl:grid-cols-4"
				}`}
			>
				{cards.map((card) => {
					const Icon = card.icon;
					return (
						<Link
							key={card.key}
							to={card.to}
							className={[
								"group rounded-2xl border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
								card.urgent
									? "border-amber-300/80 ring-1 ring-amber-200/60"
									: "border-border",
							].join(" ")}
						>
							<div className="flex items-start justify-between gap-4">
								<div className="min-w-0">
									<p className="text-sm font-medium text-muted">
										{t(card.titleKey)}
									</p>
									<p className="mt-2 text-3xl font-semibold tracking-tight text-text">
										{card.value}
									</p>
									<p className="mt-1.5 text-xs text-muted">
										{t(card.descKey)}
									</p>
								</div>
								<div
									className={[
										"flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105",
										card.urgent ? "bg-amber-50" : "bg-light-gold",
									].join(" ")}
								>
									<Icon
										className={[
											"size-5",
											card.urgent ? "text-amber-600" : "text-gold",
										].join(" ")}
										aria-hidden="true"
									/>
								</div>
							</div>
						</Link>
					);
				})}
			</div>
		</section>
	);
};

export default NeedsAttentionCards;

import {
	CalendarClock,
	CheckSquare,
	MapPin,
	Phone,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingSkeleton from "./LoadingSkeleton";

function formatTime(value) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleTimeString(undefined, {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function typeIcon(type) {
	const key = String(type ?? "").toLowerCase();
	if (key.includes("call") || key.includes("phone")) return Phone;
	if (key.includes("meeting") || key.includes("visit")) return MapPin;
	if (key.includes("follow")) return CalendarClock;
	return CheckSquare;
}

const statusStyles = {
	overdue: "bg-danger/10 text-danger",
	due_today: "bg-warning/10 text-warning",
};

const TodaySchedule = ({ items, isLoading, isError, onRetry }) => {
	const { t } = useTranslation();

	if (isLoading) return <LoadingSkeleton variant="table" />;

	return (
		<section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<div>
				<h2 className="text-[22px] font-semibold tracking-tight text-text">
					{t("dashboard.schedule.title")}
				</h2>
				<p className="mt-1 text-sm text-muted">
					{t("dashboard.schedule.subtitle")}
				</p>
			</div>

			{isError ? (
				<ErrorState onRetry={onRetry} />
			) : !items?.length ? (
				<EmptyState
					icon={CalendarClock}
					title={t("dashboard.schedule.emptyTitle")}
					message={t("dashboard.schedule.emptyMessage")}
				/>
			) : (
				<ul className="relative mt-6 space-y-0 ps-2">
					<div
						className="absolute start-[19px] top-2 bottom-2 w-px bg-border"
						aria-hidden="true"
					/>
					{items.map((item, index) => {
						const Icon = typeIcon(item.type);
						return (
							<motion.li
								key={item.id}
								initial={{ opacity: 0, x: -8 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.04 }}
							>
								<Link
									to={item.href}
									className="group relative flex gap-4 rounded-xl py-3 pe-2 ps-1 transition-colors hover:bg-background/80"
								>
									<div className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-sm group-hover:border-gold/40">
										<Icon className="size-4" aria-hidden="true" />
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-2">
											<span className="text-xs font-semibold tabular-nums text-muted">
												{formatTime(item.dueAt)}
											</span>
											<span
												className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[item.status] ?? "bg-background text-muted"}`}
											>
												{t(`dashboard.workQueue.urgency.${item.status}`, {
													defaultValue: item.status,
												})}
											</span>
										</div>
										<p className="mt-1 truncate text-sm font-semibold text-text">
											{item.title}
										</p>
										<p className="truncate text-xs text-muted">
											{t(`dashboard.workQueue.kinds.${item.kind}`, {
												defaultValue: item.subtitle,
											})}
											{item.subtitle ? ` · ${item.subtitle}` : ""}
										</p>
									</div>
								</Link>
							</motion.li>
						);
					})}
				</ul>
			)}
		</section>
	);
};

export default TodaySchedule;

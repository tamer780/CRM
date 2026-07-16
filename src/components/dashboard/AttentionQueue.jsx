import { ListTodo } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingSkeleton from "./LoadingSkeleton";

function formatDue(value) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function overdueLabel(dueAt, t) {
	if (!dueAt) return null;
	const date = new Date(dueAt);
	if (Number.isNaN(date.getTime())) return null;
	const diffMs = Date.now() - date.getTime();
	if (diffMs <= 0) return null;
	const hours = Math.floor(diffMs / (1000 * 60 * 60));
	if (hours < 24) return t("dashboard.queue.overdueHours", { count: hours || 1 });
	const days = Math.floor(hours / 24);
	return t("dashboard.queue.overdueDays", { count: days });
}

const urgencyStyles = {
	overdue: "bg-danger/10 text-danger",
	due_today: "bg-warning/10 text-warning",
	unassigned: "bg-slate-100 text-slate-700",
};

const AttentionQueue = ({ items, isLoading, isError, onRetry }) => {
	const { t } = useTranslation();

	if (isLoading) return <LoadingSkeleton variant="table" />;

	return (
		<section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<div>
				<h2 className="text-[22px] font-semibold tracking-tight text-text">
					{t("dashboard.queue.title")}
				</h2>
				<p className="mt-1 text-sm text-muted">{t("dashboard.queue.subtitle")}</p>
			</div>

			{isError ? (
				<ErrorState onRetry={onRetry} />
			) : !items?.length ? (
				<EmptyState
					icon={ListTodo}
					title={t("dashboard.workQueue.emptyTitle")}
					message={t("dashboard.workQueue.emptyMessage")}
				/>
			) : (
				<ul className="mt-5 divide-y divide-border overflow-hidden rounded-xl border border-border">
					{items.map((item, index) => (
						<motion.li
							key={item.id}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: index * 0.03 }}
						>
							<div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
								<div className="min-w-0">
									<div className="flex flex-wrap items-center gap-2">
										<span
											className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${urgencyStyles[item.urgency] ?? "bg-background text-muted"}`}
										>
											{t(`dashboard.workQueue.urgency.${item.urgency}`)}
										</span>
										{item.urgency === "overdue" && overdueLabel(item.dueAt, t) && (
											<span className="text-xs text-danger">
												{overdueLabel(item.dueAt, t)}
											</span>
										)}
									</div>
									<p className="mt-1 truncate text-sm font-semibold text-text">
										{item.title}
									</p>
									<p className="truncate text-xs text-muted">
										{t(`dashboard.workQueue.kinds.${item.kind}`, {
											defaultValue: item.subtitle,
										})}
										{item.dueAt ? ` · ${formatDue(item.dueAt)}` : ""}
									</p>
								</div>
								<div className="flex shrink-0 flex-wrap gap-2">
									<Link
										to={item.href}
										className="inline-flex rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-secondary"
									>
										{t("dashboard.queue.open")}
									</Link>
									{item.leadId != null && (
										<Link
											to={`/leads?selected=${item.leadId}`}
											className="inline-flex rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:border-gold/50"
										>
											{t("dashboard.queue.viewDetails")}
										</Link>
									)}
								</div>
							</div>
						</motion.li>
					))}
				</ul>
			)}
		</section>
	);
};

export default AttentionQueue;

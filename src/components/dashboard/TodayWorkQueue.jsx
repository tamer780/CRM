import { ListTodo } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingSkeleton from "./LoadingSkeleton";

function formatDueAt(value) {
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

const urgencyStyles = {
	overdue: "bg-red-50 text-red-700",
	due_today: "bg-amber-50 text-amber-700",
	unassigned: "bg-slate-100 text-slate-700",
};

const TodayWorkQueue = ({
	items,
	variant = "manager",
	isLoading,
	isError,
	onRetry,
}) => {
	const { t } = useTranslation();

	if (isLoading) {
		return <LoadingSkeleton variant="table" />;
	}

	return (
		<section className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
			<h2 className="text-lg font-semibold tracking-tight text-text">
				{t("dashboard.workQueue.title")}
			</h2>
			<p className="mt-1 text-sm text-muted">
				{t(
					variant === "sales"
						? "dashboard.workQueue.subtitleSales"
						: "dashboard.workQueue.subtitle",
				)}
			</p>

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
					{items.map((item) => (
						<li key={item.id}>
							<Link
								to={item.href}
								className="flex items-start justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-background/70"
							>
								<div className="min-w-0">
									<p className="truncate font-medium text-text">
										{item.title}
									</p>
									<p className="mt-0.5 truncate text-sm text-muted">
										{t(`dashboard.workQueue.kinds.${item.kind}`, {
											defaultValue: item.subtitle,
										})}
										{item.dueAt ? ` · ${formatDueAt(item.dueAt)}` : ""}
									</p>
								</div>
								<span
									className={[
										"shrink-0 rounded-md px-2 py-1 text-xs font-medium",
										urgencyStyles[item.urgency] ?? urgencyStyles.unassigned,
									].join(" ")}
								>
									{t(`dashboard.workQueue.urgency.${item.urgency}`)}
								</span>
							</Link>
						</li>
					))}
				</ul>
			)}
		</section>
	);
};

export default TodayWorkQueue;

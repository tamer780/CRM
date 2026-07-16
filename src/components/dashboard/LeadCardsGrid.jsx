import { UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingSkeleton from "./LoadingSkeleton";
import StatusBadge from "./StatusBadge";

function initials(name) {
	if (!name) return "?";
	const parts = String(name).trim().split(/\s+/).slice(0, 2);
	return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

function formatRelative(value, t) {
	if (!value) return t("dashboard.leads.noContact");
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

const LeadCardsGrid = ({
	leads,
	usersById = {},
	projectsById = {},
	isLoading,
	isError,
	onRetry,
}) => {
	const { t } = useTranslation();

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<LoadingSkeleton key={i} variant="card" />
				))}
			</div>
		);
	}

	return (
		<section className="space-y-3">
			<div className="flex items-start justify-between gap-3">
				<div>
					<h2 className="text-[22px] font-semibold tracking-tight text-text">
						{t("dashboard.leads.title")}
					</h2>
					<p className="mt-1 text-sm text-muted">{t("dashboard.leads.subtitle")}</p>
				</div>
				<Link
					to="/leads"
					className="text-sm font-medium text-primary hover:text-secondary"
				>
					{t("dashboard.leads.viewAll")}
				</Link>
			</div>

			{isError ? (
				<div className="rounded-xl border border-border bg-surface shadow-sm">
					<ErrorState onRetry={onRetry} />
				</div>
			) : !leads?.length ? (
				<div className="rounded-xl border border-border bg-surface shadow-sm">
					<EmptyState
						icon={UserPlus}
						title={t("dashboard.recentLeads.emptyTitle")}
						message={t("dashboard.recentLeads.emptyMessage")}
					/>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
					{leads.map((lead, index) => {
						const assignee = usersById[String(lead.assigned_to)];
						const project = projectsById[String(lead.project_id)];
						const lastContact =
							lead.next_follow_up_at ?? lead.updated_at ?? lead.created_at;

						return (
							<motion.article
								key={lead.id}
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.04 }}
								whileHover={{ y: -3 }}
								className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
							>
								<div className="flex items-start gap-3">
									<div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
										{initials(lead.name)}
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate font-semibold text-text">
											{lead.name ?? `Lead #${lead.id}`}
										</p>
										<p className="truncate text-xs text-muted">
											{lead.phone ?? "—"}
										</p>
									</div>
									<StatusBadge status={lead.status} />
								</div>

								<dl className="mt-4 space-y-2 text-xs text-muted">
									<div className="flex justify-between gap-2">
										<dt>{t("dashboard.recentLeads.source")}</dt>
										<dd className="font-medium capitalize text-text">
											{lead.source
												? t(`leads.source.${lead.source}`, {
														defaultValue: String(lead.source).replaceAll("_", " "),
													})
												: "—"}
										</dd>
									</div>
									<div className="flex justify-between gap-2">
										<dt>{t("dashboard.leads.project")}</dt>
										<dd className="truncate font-medium text-text">
											{project?.name ?? (lead.project_id != null ? `#${lead.project_id}` : "—")}
										</dd>
									</div>
									<div className="flex justify-between gap-2">
										<dt>{t("dashboard.leads.assignee")}</dt>
										<dd className="truncate font-medium text-text">
											{assignee?.name ??
												(lead.assigned_to != null ? `#${lead.assigned_to}` : "—")}
										</dd>
									</div>
									<div className="flex justify-between gap-2">
										<dt>{t("dashboard.leads.lastContact")}</dt>
										<dd className="font-medium text-text">
											{formatRelative(lastContact, t)}
										</dd>
									</div>
								</dl>

								<Link
									to={`/leads?selected=${lead.id}`}
									className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-secondary"
								>
									{t("dashboard.leads.open")}
								</Link>
							</motion.article>
						);
					})}
				</div>
			)}
		</section>
	);
};

export default LeadCardsGrid;

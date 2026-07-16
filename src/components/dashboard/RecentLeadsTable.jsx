import { UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingSkeleton from "./LoadingSkeleton";
import StatusBadge from "./StatusBadge";

function formatDate(value) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

const RecentLeadsTable = ({ leads, isLoading, isError, onRetry }) => {
	const { t } = useTranslation();

	if (isLoading) {
		return <LoadingSkeleton variant="table" />;
	}

	return (
		<section className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
			<h2 className="text-lg font-semibold tracking-tight text-text">
				{t("dashboard.recentLeads.title")}
			</h2>
			<p className="mt-1 text-sm text-muted">
				{t("dashboard.recentLeads.subtitle")}
			</p>

			{isError ? (
				<ErrorState onRetry={onRetry} />
			) : !leads?.length ? (
				<EmptyState
					icon={UserPlus}
					title={t("dashboard.recentLeads.emptyTitle")}
					message={t("dashboard.recentLeads.emptyMessage")}
				/>
			) : (
				<div className="mt-5 overflow-x-auto rounded-xl border border-border">
					<table className="min-w-full text-start text-sm">
						<thead className="bg-background/80 text-xs font-semibold uppercase tracking-wide text-muted">
							<tr>
								<th className="px-4 py-3 text-start">
									{t("dashboard.recentLeads.name")}
								</th>
								<th className="px-4 py-3 text-start">
									{t("dashboard.recentLeads.phone")}
								</th>
								<th className="px-4 py-3 text-start">
									{t("dashboard.recentLeads.source")}
								</th>
								<th className="px-4 py-3 text-start">
									{t("dashboard.recentLeads.status")}
								</th>
								<th className="px-4 py-3 text-start">
									{t("dashboard.recentLeads.created")}
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border bg-surface">
							{leads.map((lead) => (
								<tr
									key={lead.id}
									className="transition-colors hover:bg-background/70"
								>
									<td className="px-4 py-3 font-medium text-text">
										{lead.name ?? "—"}
									</td>
									<td className="px-4 py-3 text-muted" dir="ltr">
										{lead.phone ?? "—"}
									</td>
									<td className="px-4 py-3 capitalize text-muted">
										{lead.source ?? "—"}
									</td>
									<td className="px-4 py-3">
										<StatusBadge status={lead.status} />
									</td>
									<td className="px-4 py-3 text-muted">
										{formatDate(lead.created_at)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
};

export default RecentLeadsTable;

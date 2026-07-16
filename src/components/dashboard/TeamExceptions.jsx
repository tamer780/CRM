import { UsersRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingSkeleton from "./LoadingSkeleton";
import RateBar from "./RateBar";

const TeamExceptions = ({
	teams,
	contactRateMin = 50,
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
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h2 className="text-lg font-semibold tracking-tight text-text">
						{t("dashboard.exceptions.title")}
					</h2>
					<p className="mt-1 text-sm text-muted">
						{t("dashboard.exceptions.subtitle", { min: contactRateMin })}
					</p>
				</div>
				<Link
					to="/kpi"
					className="text-sm font-medium text-primary hover:text-secondary"
				>
					{t("dashboard.exceptions.viewKpis")}
				</Link>
			</div>

			{isError ? (
				<ErrorState onRetry={onRetry} />
			) : !teams?.length ? (
				<EmptyState
					icon={UsersRound}
					title={t("dashboard.exceptions.emptyTitle")}
					message={t("dashboard.exceptions.emptyMessage")}
				/>
			) : (
				<div className="mt-5 overflow-x-auto rounded-xl border border-border">
					<table className="min-w-full text-start text-sm">
						<thead className="bg-background/80 text-xs font-semibold uppercase tracking-wide text-muted">
							<tr>
								<th className="px-4 py-3 text-start">
									{t("dashboard.teamPerformance.teamId")}
								</th>
								<th className="px-4 py-3 text-start">
									{t("dashboard.teamPerformance.assigned")}
								</th>
								<th className="px-4 py-3 text-start">
									{t("dashboard.teamPerformance.contactRate")}
								</th>
								<th className="px-4 py-3 text-start">
									{t("dashboard.teamPerformance.conversionRate")}
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border bg-surface">
							{teams.map((team) => (
								<tr
									key={team.team_id ?? team.id}
									className="transition-colors hover:bg-background/70"
								>
									<td className="px-4 py-3 font-medium text-text">
										{team.team_id ?? team.id ?? "—"}
									</td>
									<td className="px-4 py-3 text-muted">
										{team.total_assigned ?? 0}
									</td>
									<td className="px-4 py-3">
										<RateBar value={team.contact_rate} />
									</td>
									<td className="px-4 py-3">
										<RateBar value={team.conversion_rate} />
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

export default TeamExceptions;

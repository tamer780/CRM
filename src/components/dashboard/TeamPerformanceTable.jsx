import { UsersRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingSkeleton from "./LoadingSkeleton";
import RateBar from "./RateBar";

const TeamPerformanceTable = ({ teams, isLoading, isError, onRetry }) => {
	const { t } = useTranslation();

	if (isLoading) {
		return <LoadingSkeleton variant="table" />;
	}

	return (
		<section className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
			<h2 className="text-lg font-semibold tracking-tight text-text">
				{t("dashboard.teamPerformance.title")}
			</h2>
			<p className="mt-1 text-sm text-muted">
				{t("dashboard.teamPerformance.subtitle")}
			</p>

			{isError ? (
				<ErrorState onRetry={onRetry} />
			) : !teams?.length ? (
				<EmptyState
					icon={UsersRound}
					title={t("dashboard.teamPerformance.emptyTitle")}
					message={t("dashboard.teamPerformance.emptyMessage")}
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
									{t("dashboard.teamPerformance.contacted")}
								</th>
								<th className="px-4 py-3 text-start">
									{t("dashboard.teamPerformance.qualified")}
								</th>
								<th className="px-4 py-3 text-start">
									{t("dashboard.teamPerformance.converted")}
								</th>
								<th className="px-4 py-3 text-start">
									{t("dashboard.teamPerformance.contactRate")}
								</th>
								<th className="px-4 py-3 text-start">
									{t("dashboard.teamPerformance.qualificationRate")}
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
									<td className="px-4 py-3 text-muted">
										{team.contacted ?? 0}
									</td>
									<td className="px-4 py-3 text-muted">
										{team.qualified ?? 0}
									</td>
									<td className="px-4 py-3 text-muted">
										{team.converted ?? 0}
									</td>
									<td className="px-4 py-3">
										<RateBar value={team.contact_rate} />
									</td>
									<td className="px-4 py-3">
										<RateBar value={team.qualification_rate} />
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

export default TeamPerformanceTable;

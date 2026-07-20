import { UsersRound } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import EmptyState from "../dashboard/EmptyState";
import ErrorState from "../dashboard/ErrorState";
import LoadingSkeleton from "../dashboard/LoadingSkeleton";
import RateBar from "../dashboard/RateBar";
import { formatRate } from "./kpiFormatters";

const TeamKpiCards = ({
	teams,
	isLoading,
	isError,
	onRetry,
	hasPeriod,
	onSelectTeam,
}) => {
	const { t } = useTranslation();

	const sortedTeams = useMemo(
		() =>
			[...(teams ?? [])].sort((a, b) => {
				const convDiff =
					(Number(b.conversion_rate) || 0) - (Number(a.conversion_rate) || 0);
				if (convDiff !== 0) return convDiff;
				return (Number(b.total_assigned) || 0) - (Number(a.total_assigned) || 0);
			}),
		[teams],
	);

	if (!hasPeriod) {
		return (
			<div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted shadow-sm">
				{t("kpi.selectDates")}
			</div>
		);
	}

	if (isLoading) {
		return (
			<section className="space-y-3">
				<div>
					<h2 className="text-lg font-semibold tracking-tight text-text">
						{t("kpi.teams.title")}
					</h2>
					<p className="mt-1 text-sm text-muted">{t("kpi.teams.subtitle")}</p>
				</div>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
					{Array.from({ length: 3 }).map((_, index) => (
						<LoadingSkeleton key={index} variant="card" />
					))}
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-5">
			<div>
				<h2 className="text-lg font-semibold tracking-tight text-text">
					{t("kpi.teams.title")}
				</h2>
				<p className="mt-1 text-sm text-muted">{t("kpi.teams.subtitle")}</p>
			</div>

			{isError ? (
				<div className="rounded-2xl border border-border bg-surface shadow-sm">
					<ErrorState onRetry={onRetry} />
				</div>
			) : !sortedTeams.length ? (
				<EmptyState
					icon={UsersRound}
					title={t("kpi.teams.emptyTitle")}
					message={t("kpi.teams.emptyMessage")}
				/>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
					{sortedTeams.map((team) => {
						const isInactive =
							(team.total_assigned ?? 0) === 0 &&
							(team.meetings?.total ?? 0) === 0;
						const isLowContact = (Number(team.contact_rate) || 0) < 50;

						return (
							<button
								key={team.team_id ?? team.id}
								type="button"
								onClick={() => onSelectTeam?.(team)}
								className="rounded-xl border border-border bg-surface p-5 text-start shadow-sm transition hover:border-accent/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
							>
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="font-semibold text-text">
											{team.team_name ?? team.name ?? "—"}
										</p>
										{isInactive && (
											<p className="mt-0.5 text-xs font-medium text-muted">
												{t("kpi.teams.inactive")}
											</p>
										)}
										{!isInactive && isLowContact && (
											<p className="mt-0.5 text-xs font-medium text-warning">
												{t("kpi.teams.lowContact")}
											</p>
										)}
									</div>
									<span className="text-xs text-muted">
										{t("kpi.teams.viewDetails")}
									</span>
								</div>

								<div className="mt-4 grid grid-cols-2 gap-3">
									<div>
										<p className="text-lg font-semibold text-text">
											{team.total_assigned ?? 0}
										</p>
										<p className="text-[11px] text-muted">
											{t("kpi.sales.totalAssigned")}
										</p>
									</div>
									<div>
										<p className="text-lg font-semibold text-text">
											{team.converted ?? 0}
										</p>
										<p className="text-[11px] text-muted">
											{t("kpi.sales.converted")}
										</p>
									</div>
								</div>

								<div className="mt-4 space-y-2">
									<div className="flex items-center justify-between text-xs text-muted">
										<span>{t("kpi.sales.contactRate")}</span>
										<span>{formatRate(team.contact_rate)}</span>
									</div>
									<RateBar value={team.contact_rate} />
									<div className="flex items-center justify-between text-xs text-muted">
										<span>{t("kpi.sales.conversionRate")}</span>
										<span>{formatRate(team.conversion_rate)}</span>
									</div>
									<RateBar value={team.conversion_rate} />
								</div>

								<div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-3 text-xs text-muted">
									<span>
										{t("kpi.teams.meetings.showRate")}:{" "}
										<span className="font-medium text-text">
											{formatRate(team.meetings?.show_rate)}
										</span>
									</span>
									<span>
										{t("kpi.teams.meetings.purchaseRate")}:{" "}
										<span className="font-medium text-text">
											{formatRate(team.meetings?.purchase_rate)}
										</span>
									</span>
								</div>
							</button>
						);
					})}
				</div>
			)}
		</section>
	);
};

export default TeamKpiCards;

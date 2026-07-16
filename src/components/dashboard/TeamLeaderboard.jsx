import { Crown, UsersRound } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingSkeleton from "./LoadingSkeleton";
import RateBar from "./RateBar";

function formatRate(value) {
	const rate = Number(value) || 0;
	return `${Number.isInteger(rate) ? rate : rate.toFixed(1)}%`;
}

const TeamLeaderboard = ({ teams, isLoading, isError, onRetry }) => {
	const { t } = useTranslation();

	if (isLoading) return <LoadingSkeleton variant="table" />;

	return (
		<section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h2 className="text-[22px] font-semibold tracking-tight text-text">
						{t("dashboard.leaderboard.title")}
					</h2>
					<p className="mt-1 text-sm text-muted">
						{t("dashboard.leaderboard.subtitle")}
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
					title={t("dashboard.teamPerformance.emptyTitle")}
					message={t("dashboard.teamPerformance.emptyMessage")}
				/>
			) : (
				<div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
					{teams.map((team, index) => (
						<motion.article
							key={team.team_id ?? team.id ?? index}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.04 }}
							className={[
								"rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md",
								team.isTop
									? "border-gold/50 bg-gradient-to-br from-light-gold/40 to-surface"
									: "border-border bg-surface",
							].join(" ")}
						>
							<div className="flex items-start justify-between gap-3">
								<div className="flex items-center gap-3">
									<div
										className={[
											"flex size-10 items-center justify-center rounded-full text-sm font-bold",
											team.isTop
												? "bg-gold text-white"
												: "bg-primary/10 text-primary",
										].join(" ")}
									>
										#{team.rank}
									</div>
									<div>
										<p className="font-semibold text-text">{team.displayName}</p>
										{team.isLowContact && (
											<p className="mt-0.5 text-xs font-medium text-warning">
												{t("dashboard.leaderboard.lowContact")}
											</p>
										)}
									</div>
								</div>
								{team.isTop && (
									<Crown className="size-5 text-gold" aria-hidden="true" />
								)}
							</div>

							<div className="mt-4 grid grid-cols-3 gap-2 text-center">
								<div>
									<p className="text-lg font-semibold text-text">
										{team.total_assigned ?? 0}
									</p>
									<p className="text-[11px] text-muted">
										{t("dashboard.teamPerformance.assigned")}
									</p>
								</div>
								<div>
									<p className="text-lg font-semibold text-text">
										{team.converted ?? 0}
									</p>
									<p className="text-[11px] text-muted">
										{t("dashboard.teamPerformance.converted")}
									</p>
								</div>
								<div>
									<p className="text-lg font-semibold text-text">
										{formatRate(team.conversion_rate)}
									</p>
									<p className="text-[11px] text-muted">
										{t("dashboard.teamPerformance.conversionRate")}
									</p>
								</div>
							</div>

							<div className="mt-4 space-y-2">
								<div className="flex items-center justify-between text-xs text-muted">
									<span>{t("dashboard.teamPerformance.contactRate")}</span>
									<span>{formatRate(team.contact_rate)}</span>
								</div>
								<RateBar value={team.contact_rate} />
							</div>
						</motion.article>
					))}
				</div>
			)}
		</section>
	);
};

export default TeamLeaderboard;

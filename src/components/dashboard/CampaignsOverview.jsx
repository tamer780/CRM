import { Megaphone } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { computeRoi } from "../../features/campaigns/utils/campaignConstants";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingSkeleton from "./LoadingSkeleton";

function formatMoney(value) {
	const n = Number(value) || 0;
	return n.toLocaleString(undefined, {
		maximumFractionDigits: 0,
	});
}

const statusTone = {
	active: "bg-success/10 text-success",
	draft: "bg-slate-100 text-slate-700",
	completed: "bg-primary/10 text-primary",
	paused: "bg-warning/10 text-warning",
};

const CampaignsOverview = ({ campaigns, isLoading, isError, onRetry }) => {
	const { t } = useTranslation();
	const list = (campaigns ?? []).slice(0, 5);

	if (isLoading) return <LoadingSkeleton variant="table" />;

	return (
		<section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<div className="flex items-start justify-between gap-3">
				<div>
					<h2 className="text-[22px] font-semibold tracking-tight text-text">
						{t("dashboard.campaigns.title")}
					</h2>
					<p className="mt-1 text-sm text-muted">
						{t("dashboard.campaigns.subtitle")}
					</p>
				</div>
				<Link
					to="/campaigns"
					className="text-sm font-medium text-primary hover:text-secondary"
				>
					{t("dashboard.campaigns.viewAll")}
				</Link>
			</div>

			{isError ? (
				<ErrorState onRetry={onRetry} />
			) : !list.length ? (
				<EmptyState
					icon={Megaphone}
					title={t("dashboard.campaigns.emptyTitle")}
					message={t("dashboard.campaigns.emptyMessage")}
				/>
			) : (
				<ul className="mt-5 space-y-3">
					{list.map((campaign, index) => {
						const status = String(campaign.status ?? "").toLowerCase();
						const roi = computeRoi(campaign.revenue, campaign.spent_amount);
						const spend = Number(campaign.budget) || 0;
						const spent = Number(campaign.spent_amount) || 0;
						const progress =
							spend > 0 ? Math.min(100, (spent / spend) * 100) : 0;

						return (
							<motion.li
								key={campaign.id}
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.04 }}
							>
								<Link
									to="/campaigns"
									className="block rounded-xl border border-border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
								>
									<div className="flex items-start justify-between gap-3">
										<p className="font-semibold text-text">
											{campaign.name ?? `Campaign #${campaign.id}`}
										</p>
										<span
											className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${statusTone[status] ?? "bg-background text-muted"}`}
										>
											{t(`campaigns.status.${status}`, {
												defaultValue: status || "—",
											})}
										</span>
									</div>
									<div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted">
										<div>
											<p className="text-[11px]">{t("dashboard.campaigns.budget")}</p>
											<p className="mt-0.5 font-semibold text-text">
												{formatMoney(campaign.budget)}
											</p>
										</div>
										<div>
											<p className="text-[11px]">
												{t("dashboard.campaigns.revenue")}
											</p>
											<p className="mt-0.5 font-semibold text-text">
												{formatMoney(campaign.revenue)}
											</p>
										</div>
										<div>
											<p className="text-[11px]">{t("dashboard.campaigns.roi")}</p>
											<p className="mt-0.5 font-semibold text-text">
												{formatMoney(roi)}
											</p>
										</div>
									</div>
									<div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background">
										<div
											className="h-full rounded-full bg-gold"
											style={{ width: `${progress}%` }}
											aria-hidden="true"
										/>
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

export default CampaignsOverview;

import { Filter } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingSkeleton from "./LoadingSkeleton";

function formatPct(value) {
	const n = Number(value) || 0;
	return `${Number.isInteger(n) ? n : n.toFixed(0)}%`;
}

const SalesFunnel = ({ stages, isLoading, isError, onRetry }) => {
	const { t } = useTranslation();
	const maxCount = Math.max(1, ...(stages ?? []).map((s) => s.count || 0));

	if (isLoading) return <LoadingSkeleton variant="table" />;

	return (
		<section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<div>
				<h2 className="text-[22px] font-semibold tracking-tight text-text">
					{t("dashboard.funnel.title")}
				</h2>
				<p className="mt-1 text-sm text-muted">{t("dashboard.funnel.subtitle")}</p>
			</div>

			{isError ? (
				<ErrorState onRetry={onRetry} />
			) : !stages?.length || stages.every((s) => s.count === 0) ? (
				<EmptyState
					icon={Filter}
					title={t("dashboard.funnel.emptyTitle")}
					message={t("dashboard.funnel.emptyMessage")}
				/>
			) : (
				<ul className="mt-6 space-y-3">
					{stages.map((stage, index) => {
						const width = Math.max(28, (stage.count / maxCount) * 100);
						return (
							<motion.li
								key={stage.key}
								initial={{ opacity: 0, x: -6 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.05 }}
								className="space-y-1.5"
							>
								<div className="flex items-center justify-between gap-3 text-sm">
									<span className="font-medium text-text">
										{t(`dashboard.funnel.stages.${stage.key}`)}
									</span>
									<span className="tabular-nums text-muted">
										{stage.count}
										{index > 0 && (
											<span className="ms-2 text-xs">
												{t("dashboard.funnel.conversion", {
													value: formatPct(stage.conversionFromPrev),
												})}
												{" · "}
												{t("dashboard.funnel.dropOff", {
													value: formatPct(stage.dropOff),
												})}
											</span>
										)}
									</span>
								</div>
								<div className="h-10 w-full rounded-lg bg-background">
									<div
										className="flex h-full items-center rounded-lg bg-gradient-to-r from-primary to-accent px-3 text-xs font-semibold text-white shadow-sm transition-all"
										style={{ width: `${width}%` }}
									>
										{stage.count > 0 ? stage.count : ""}
									</div>
								</div>
							</motion.li>
						);
					})}
				</ul>
			)}
		</section>
	);
};

export default SalesFunnel;

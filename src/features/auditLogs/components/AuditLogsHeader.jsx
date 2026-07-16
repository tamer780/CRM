import {
	FilePlus2,
	GitCompareArrows,
	RefreshCw,
	ScrollText,
	Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import StatsCard from "../../../components/dashboard/StatsCard";

const StatsSkeleton = () => (
	<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
		{Array.from({ length: 4 }).map((_, i) => (
			<div
				key={i}
				className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
			>
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0 flex-1 space-y-3">
						<div className="h-3.5 w-16 animate-pulse rounded bg-border/70" />
						<div className="h-7 w-12 animate-pulse rounded bg-border/80" />
						<div className="h-3 w-10 animate-pulse rounded bg-border/50" />
					</div>
					<div className="size-10 animate-pulse rounded-xl bg-light-gold/70" />
				</div>
			</div>
		))}
	</div>
);

const AuditLogsHeader = ({ kpis, isLoading, isRefreshing, onRefresh }) => {
	const { t } = useTranslation();

	return (
		<div className="space-y-5">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-3">
						<h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
							{t("auditLogs.title")}
						</h1>
						<button
							type="button"
							onClick={onRefresh}
							disabled={isRefreshing}
							className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-sm font-medium text-muted shadow-sm transition hover:bg-background hover:text-text disabled:opacity-60"
							aria-label={t("auditLogs.refresh")}
						>
							<RefreshCw
								className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
								aria-hidden="true"
							/>
							{t("auditLogs.refresh")}
						</button>
					</div>
					<p className="mt-1.5 max-w-xl text-muted">{t("auditLogs.subtitle")}</p>
				</div>
			</div>

			{isLoading ? (
				<StatsSkeleton />
			) : (
				<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
					<StatsCard
						icon={ScrollText}
						title={t("auditLogs.kpis.total")}
						value={kpis.total}
						description={kpis.totalShare}
					/>
					<StatsCard
						icon={GitCompareArrows}
						title={t("auditLogs.kpis.changes")}
						value={kpis.changes}
						description={kpis.changesShare}
					/>
					<StatsCard
						icon={FilePlus2}
						title={t("auditLogs.kpis.creates")}
						value={kpis.creates}
						description={kpis.createsShare}
					/>
					<StatsCard
						icon={Users}
						title={t("auditLogs.kpis.actors")}
						value={kpis.actors}
						description={kpis.actorsShare}
					/>
				</div>
			)}
		</div>
	);
};

export default AuditLogsHeader;

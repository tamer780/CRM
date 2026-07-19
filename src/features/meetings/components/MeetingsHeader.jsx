import {
	CalendarClock,
	CheckCircle2,
	Clock,
	Home,
	Plus,
	RefreshCw,
	XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import StatsCard from "../../../components/dashboard/StatsCard";

const StatsSkeleton = () => (
	<div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
		{Array.from({ length: 5 }).map((_, i) => (
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

const MeetingsHeader = ({
	kpis,
	isLoading,
	isRefreshing,
	onRefresh,
	onCreate,
}) => {
	const { t } = useTranslation();

	return (
		<div className="space-y-5">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-3">
						<h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
							{t("meetings.title")}
						</h1>
						<button
							type="button"
							onClick={onRefresh}
							disabled={isRefreshing}
							className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-sm font-medium text-muted shadow-sm transition hover:bg-background hover:text-text disabled:opacity-60"
							aria-label={t("meetings.refresh")}
						>
							<RefreshCw
								className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
								aria-hidden="true"
							/>
							{t("meetings.refresh")}
						</button>
					</div>
					<p className="mt-1.5 max-w-xl text-muted">
						{t("meetings.subtitle")}
					</p>
				</div>

				<button
					type="button"
					onClick={onCreate}
					className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-primary shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
				>
					<Plus className="size-4" aria-hidden="true" />
					{t("meetings.newMeeting")}
				</button>
			</div>

			{isLoading ? (
				<StatsSkeleton />
			) : (
				<div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
					<StatsCard
						icon={CalendarClock}
						title={t("meetings.kpis.total")}
						value={kpis.total}
						description={kpis.totalShare}
					/>
					<StatsCard
						icon={Clock}
						title={t("meetings.kpis.scheduled")}
						value={kpis.scheduled}
						description={kpis.scheduledShare}
					/>
					<StatsCard
						icon={Home}
						title={t("meetings.kpis.visit")}
						value={kpis.visit}
						description={kpis.visitShare}
					/>
					<StatsCard
						icon={CheckCircle2}
						title={t("meetings.kpis.bought")}
						value={kpis.bought}
						description={kpis.boughtShare}
					/>
					<StatsCard
						icon={XCircle}
						title={t("meetings.kpis.canceled")}
						value={kpis.canceled}
						description={kpis.canceledShare}
					/>
				</div>
			)}
		</div>
	);
};

export default MeetingsHeader;

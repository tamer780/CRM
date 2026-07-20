import { useEffect, useRef } from "react";
import { UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import ErrorState from "../../../../components/dashboard/ErrorState";
import InfiniteScrollFooter from "../../../../components/ui/InfiniteScrollFooter";
import { useInfiniteScrollSentinel } from "../../../../hooks/ui/useInfiniteScrollSentinel";
import LeadTableRow, { LeadMobileCard } from "./LeadTableRow";

const checkboxClass =
	"size-4 rounded border-border text-gold accent-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30";

const LeadTableSkeleton = () => (
	<div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
		<div className="mb-4 hidden gap-4 md:grid md:grid-cols-9">
			{Array.from({ length: 9 }).map((_, i) => (
				<div key={i} className="h-3 animate-pulse rounded bg-border/70" />
			))}
		</div>
		<div className="space-y-3">
			{Array.from({ length: 6 }).map((_, index) => (
				<div
					key={index}
					className="flex items-center gap-3 rounded-xl border border-border/60 p-3"
				>
					<div className="size-10 shrink-0 animate-pulse rounded-full bg-border/60" />
					<div className="min-w-0 flex-1 space-y-2">
						<div className="h-3.5 w-1/3 animate-pulse rounded bg-border/80" />
						<div className="h-3 w-1/2 animate-pulse rounded bg-border/50" />
					</div>
					<div className="hidden h-6 w-20 animate-pulse rounded-full bg-border/50 sm:block" />
				</div>
			))}
		</div>
	</div>
);

const LeadEmptyState = ({ onAddLead, filtered }) => {
	const { t } = useTranslation();

	return (
		<section className="rounded-2xl border border-border bg-surface shadow-sm">
			<div className="flex flex-col items-center justify-center px-6 py-16 text-center">
				<div className="relative mb-5">
					<div
						className="absolute inset-0 scale-150 rounded-full bg-light-gold/50 blur-xl"
						aria-hidden="true"
					/>
					<div className="relative flex size-16 items-center justify-center rounded-2xl bg-light-gold shadow-sm">
						<UserPlus className="size-8 text-gold" aria-hidden="true" />
					</div>
				</div>
				<h3 className="text-lg font-semibold text-text">{t("leads.emptyTitle")}</h3>
				<p className="mt-1.5 max-w-sm text-sm text-muted">{t("leads.emptyMessage")}</p>
				{!filtered && onAddLead && (
					<button
						type="button"
						onClick={onAddLead}
						className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-primary shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
					>
						<UserPlus className="size-4" aria-hidden="true" />
						{t("leads.addLead")}
					</button>
				)}
			</div>
		</section>
	);
};

const LeadTable = ({
	leads,
	isLoading,
	isError,
	onRetry,
	onAddLead,
	isFilteredEmpty = false,
	users = [],
	onView,
	onEdit,
	onStatusChange,
	onAssignChange,
	statusUpdatingId,
	assignUpdatingId,
	selectedIds,
	onToggleSelect,
	onToggleSelectAll,
	canEdit = true,
	hasNextPage = false,
	isFetchingNextPage = false,
	fetchNextPage,
	serverTotal,
}) => {
	const { t } = useTranslation();
	const selectAllRef = useRef(null);
	const sentinelRef = useInfiniteScrollSentinel({
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	});
	const showActions = canEdit;

	const selectedCount = leads.filter((lead) =>
		selectedIds?.has(String(lead.id)),
	).length;
	const allSelected = leads.length > 0 && selectedCount === leads.length;
	const someSelected = selectedCount > 0 && !allSelected;

	const totalCount = leads?.length ?? 0;
	const shownCount = totalCount;
	const totalFromServer = serverTotal ?? totalCount;

	useEffect(() => {
		if (selectAllRef.current) {
			selectAllRef.current.indeterminate = someSelected;
		}
	}, [someSelected]);

	if (isLoading) {
		return <LeadTableSkeleton />;
	}

	if (isError) {
		return (
			<section className="rounded-2xl border border-border bg-surface shadow-sm">
				<ErrorState onRetry={onRetry} />
			</section>
		);
	}

	if (!leads?.length) {
		return <LeadEmptyState onAddLead={onAddLead} filtered={isFilteredEmpty} />;
	}

	const rowProps = {
		users,
		onView,
		onEdit,
		onStatusChange,
		onAssignChange,
		statusUpdatingId,
		assignUpdatingId,
		onToggleSelect,
		canEdit,
	};

	return (
		<>
			<section className="overflow-visible rounded-2xl border border-border bg-surface shadow-sm">
				<div className="md:hidden overflow-visible">
					{(leads ?? []).map((lead) => (
						<LeadMobileCard
							key={lead.id}
							lead={lead}
							selected={selectedIds?.has(String(lead.id))}
							{...rowProps}
						/>
					))}
				</div>

				<div className="hidden overflow-visible md:block">
					<div className="overflow-x-auto overflow-y-visible">
						<table className="min-w-full text-start text-sm">
							<thead className="relative z-0 border-b border-border bg-background/80 text-xs font-semibold uppercase tracking-wide text-muted">
								<tr>
									<th className="w-10 px-4 py-3 text-start">
										<input
											ref={selectAllRef}
											type="checkbox"
											checked={allSelected}
											onChange={onToggleSelectAll}
											aria-label={t("leads.bulk.selectAll")}
											className={checkboxClass}
										/>
									</th>
									<th className="px-4 py-3 text-start">{t("leads.columns.name")}</th>
									<th className="px-4 py-3 text-start">{t("leads.columns.status")}</th>
									<th className="px-4 py-3 text-start">
										{t("leads.columns.scheduledCall")}
									</th>
									<th className="px-4 py-3 text-start">{t("leads.columns.project")}</th>
									<th className="px-4 py-3 text-start">{t("leads.columns.assignedTo")}</th>
									<th className="px-4 py-3 text-start">{t("leads.columns.note")}</th>
									<th className="px-4 py-3 text-start">
										{t("leads.columns.lastComment")}
									</th>
									<th className="px-4 py-3 text-start">{t("leads.columns.created")}</th>
									{showActions && (
										<th className="px-4 py-3 text-end">
											<span className="sr-only">
												{t("dashboard.quickActions.title")}
											</span>
										</th>
									)}
								</tr>
							</thead>
							<tbody className="relative z-10 divide-y divide-border bg-surface">
								{(leads ?? []).map((lead) => (
									<LeadTableRow
										key={lead.id}
										lead={lead}
										selected={selectedIds?.has(String(lead.id))}
										{...rowProps}
									/>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</section>

			<InfiniteScrollFooter
				shown={shownCount}
				total={totalFromServer}
				hasNextPage={hasNextPage}
				isFetchingNextPage={isFetchingNextPage}
				sentinelRef={sentinelRef}
				loadingMoreKey="leads.pagination.loadingMore"
				endKey="leads.pagination.end"
			/>
		</>
	);
};

export default LeadTable;

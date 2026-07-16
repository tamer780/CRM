import {
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	Pencil,
	Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ErrorState from "../../../components/dashboard/ErrorState";
import CampaignStatusBadge from "../../../components/ui/CampaignStatusBadge";
import PlatformBadge from "../../../components/ui/PlatformBadge";
import SourceBadge from "../../../components/ui/SourceBadge";
import { computeRoi } from "../utils/campaignConstants";
import { formatCurrency } from "../utils/formatCurrency";
import CampaignEmptyState from "./CampaignEmptyState";

const INITIAL_VISIBLE = 20;
const CHUNK_SIZE = 20;

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

function resolveLabel(map, id) {
	if (id == null || id === "") return "—";
	const item = map.get(Number(id)) ?? map.get(String(id));
	if (!item) return String(id);
	return item.name ?? item.title ?? String(id);
}

function SortIcon({ column }) {
	const sorted = column.getIsSorted();
	if (sorted === "asc") return <ArrowUp className="size-3.5" aria-hidden="true" />;
	if (sorted === "desc") return <ArrowDown className="size-3.5" aria-hidden="true" />;
	return <ArrowUpDown className="size-3.5 opacity-40" aria-hidden="true" />;
}

function RoiCell({ revenue, spent }) {
	const roi = computeRoi(revenue, spent);
	const color =
		roi > 0
			? "text-green-700"
			: roi < 0
				? "text-red-600"
				: "text-muted";
	return (
		<span className={`whitespace-nowrap text-sm font-medium tabular-nums ${color}`}>
			{formatCurrency(roi)}
		</span>
	);
}

function DurationCell({ startedAt, endedAt, presentLabel }) {
	return (
		<div className="whitespace-nowrap text-sm text-muted">
			<span>{formatDate(startedAt)}</span>
			<span className="mx-1 text-border">↓</span>
			<span>{endedAt ? formatDate(endedAt) : presentLabel}</span>
		</div>
	);
}

function ActionButtons({
	campaign,
	actionsDisabled,
	onEdit,
	onDelete,
}) {
	const { t } = useTranslation();
	const btn =
		"inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

	return (
		<div
			className="flex flex-wrap items-center gap-1"
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
		>
			<button
				type="button"
				disabled={actionsDisabled}
				onClick={() => onEdit(campaign)}
				className={`${btn} text-primary hover:bg-light-gold/60`}
			>
				<Pencil className="size-3.5" aria-hidden="true" />
				{t("campaigns.actions.edit")}
			</button>
			<button
				type="button"
				disabled={actionsDisabled}
				onClick={() => onDelete(campaign)}
				className={`${btn} text-red-600 hover:bg-red-50`}
			>
				<Trash2 className="size-3.5" aria-hidden="true" />
				{t("campaigns.actions.delete")}
			</button>
		</div>
	);
}

const TableSkeleton = () => (
	<div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
		<div className="space-y-3">
			{Array.from({ length: 6 }).map((_, index) => (
				<div
					key={index}
					className="flex items-center gap-3 rounded-xl border border-border/60 p-3"
				>
					<div className="min-w-0 flex-1 space-y-2">
						<div className="h-3.5 w-1/3 animate-pulse rounded bg-border/80" />
						<div className="h-3 w-1/4 animate-pulse rounded bg-border/50" />
					</div>
					<div className="h-6 w-20 animate-pulse rounded-full bg-border/50" />
				</div>
			))}
		</div>
	</div>
);

const CampaignsTable = ({
	campaigns,
	isLoading,
	isError,
	onRetry,
	isFilteredEmpty = false,
	projectsMap,
	sorting,
	onSortingChange,
	actionsDisabled = false,
	onView,
	onEdit,
	onDelete,
	onCreate,
}) => {
	const { t } = useTranslation();
	const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
	const sentinelRef = useRef(null);

	useEffect(() => {
		setVisibleCount(INITIAL_VISIBLE);
	}, [campaigns]);

	const columns = useMemo(
		() => [
			{
				accessorKey: "name",
				id: "campaign",
				header: t("campaigns.columns.campaign"),
				cell: ({ row }) => {
					const c = row.original;
					return (
						<div className="min-w-[10rem]">
							<p className="font-medium text-text">{c.name ?? "—"}</p>
							{c.external_reference && (
								<p className="mt-0.5 truncate text-xs text-muted">
									{c.external_reference}
								</p>
							)}
						</div>
					);
				},
			},
			{
				accessorKey: "platform",
				header: t("campaigns.columns.platform"),
				cell: ({ getValue }) => <PlatformBadge platform={getValue()} />,
			},
			{
				id: "project",
				accessorFn: (row) => resolveLabel(projectsMap, row.project_id),
				header: t("campaigns.columns.project"),
				cell: ({ getValue }) => (
					<span className="text-sm text-muted">{getValue()}</span>
				),
			},
			{
				accessorKey: "source",
				header: t("campaigns.columns.source"),
				cell: ({ getValue }) => <SourceBadge source={getValue()} />,
			},
			{
				accessorKey: "budget",
				header: t("campaigns.columns.budget"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm tabular-nums text-text">
						{formatCurrency(getValue())}
					</span>
				),
			},
			{
				accessorKey: "spent_amount",
				header: t("campaigns.columns.spent"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm tabular-nums text-text">
						{formatCurrency(getValue())}
					</span>
				),
			},
			{
				accessorKey: "revenue",
				header: t("campaigns.columns.revenue"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm tabular-nums text-text">
						{formatCurrency(getValue())}
					</span>
				),
			},
			{
				id: "roi",
				accessorFn: (row) => computeRoi(row.revenue, row.spent_amount),
				header: t("campaigns.columns.roi"),
				cell: ({ row }) => (
					<RoiCell
						revenue={row.original.revenue}
						spent={row.original.spent_amount}
					/>
				),
			},
			{
				accessorKey: "status",
				header: t("campaigns.columns.status"),
				cell: ({ getValue }) => <CampaignStatusBadge status={getValue()} />,
			},
			{
				id: "duration",
				accessorFn: (row) => row.started_at ?? "",
				header: t("campaigns.columns.duration"),
				cell: ({ row }) => (
					<DurationCell
						startedAt={row.original.started_at}
						endedAt={row.original.ended_at}
						presentLabel={t("campaigns.present")}
					/>
				),
			},
			{
				accessorKey: "created_at",
				header: t("campaigns.columns.created"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm text-muted">
						{formatDate(getValue())}
					</span>
				),
			},
			{
				id: "actions",
				enableSorting: false,
				header: t("campaigns.columns.actions"),
				cell: ({ row }) => (
					<ActionButtons
						campaign={row.original}
						actionsDisabled={actionsDisabled}
						onEdit={onEdit}
						onDelete={onDelete}
					/>
				),
			},
		],
		[t, projectsMap, actionsDisabled, onEdit, onDelete],
	);

	const table = useReactTable({
		data: campaigns ?? [],
		columns,
		state: {
			sorting,
		},
		onSortingChange,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getRowId: (row) => String(row.id),
	});

	const allRows = table.getRowModel().rows;
	const totalCount = allRows.length;
	const visibleRows = allRows.slice(0, visibleCount);
	const hasMore = visibleCount < totalCount;

	useEffect(() => {
		const node = sentinelRef.current;
		if (!node || !hasMore) return undefined;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					setVisibleCount((prev) =>
						Math.min(prev + CHUNK_SIZE, totalCount),
					);
				}
			},
			{ root: null, rootMargin: "200px", threshold: 0 },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [hasMore, totalCount, visibleCount]);

	if (isLoading) return <TableSkeleton />;

	if (isError) {
		return (
			<section className="rounded-2xl border border-border bg-surface shadow-sm">
				<ErrorState
					message={t("campaigns.errors.loadFailed")}
					onRetry={onRetry}
				/>
			</section>
		);
	}

	if (!campaigns?.length) {
		return (
			<CampaignEmptyState filtered={isFilteredEmpty} onCreate={onCreate} />
		);
	}

	return (
		<>
			{/* Mobile */}
			<div className="rounded-2xl border border-border bg-surface shadow-sm md:hidden">
				{visibleRows.map((row) => {
					const c = row.original;
					return (
						<article
							key={row.id}
							className="border-b border-border px-4 py-4 last:border-b-0"
						>
							<button
								type="button"
								className="w-full text-start"
								onClick={() => onView(c)}
							>
								<div className="flex flex-wrap items-center gap-2">
									<p className="font-medium text-text">{c.name ?? "—"}</p>
									<CampaignStatusBadge status={c.status} />
								</div>
								{c.external_reference && (
									<p className="mt-0.5 text-xs text-muted">
										{c.external_reference}
									</p>
								)}
								<div className="mt-2 flex flex-wrap gap-2">
									<PlatformBadge platform={c.platform} />
									<span className="text-xs text-muted">
										{formatCurrency(c.budget)}
									</span>
								</div>
							</button>
							<div className="mt-3 border-t border-border/60 pt-3">
								<ActionButtons
									campaign={c}
									actionsDisabled={actionsDisabled}
									onEdit={onEdit}
									onDelete={onDelete}
								/>
							</div>
						</article>
					);
				})}
			</div>

			{/* Desktop */}
			<section className="hidden overflow-hidden rounded-2xl border border-border bg-surface shadow-sm md:block">
				<div className="overflow-x-auto">
					<table className="min-w-full text-start text-sm">
						<thead className="bg-background/80 text-xs font-semibold uppercase tracking-wide text-muted">
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										const isActions = header.column.id === "actions";
										return (
											<th
												key={header.id}
												className={[
													"px-4 py-3 text-start",
													isActions
														? "sticky end-0 z-10 bg-background/95 shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.08)]"
														: "",
												].join(" ")}
											>
												{header.isPlaceholder ? null : header.column.getCanSort() ? (
													<button
														type="button"
														className="inline-flex items-center gap-1.5 transition hover:text-text"
														onClick={header.column.getToggleSortingHandler()}
													>
														{flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
														<SortIcon column={header.column} />
													</button>
												) : (
													flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)
												)}
											</th>
										);
									})}
								</tr>
							))}
						</thead>
						<tbody className="divide-y divide-border bg-surface">
							{visibleRows.map((row) => (
								<tr
									key={row.id}
									role="button"
									tabIndex={0}
									onClick={() => onView(row.original)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											onView(row.original);
										}
									}}
									className="cursor-pointer transition-colors hover:bg-background/70"
								>
									{row.getVisibleCells().map((cell) => {
										const isActions = cell.column.id === "actions";
										return (
											<td
												key={cell.id}
												className={[
													"px-4 py-3 align-middle",
													isActions
														? "sticky end-0 z-[1] bg-surface shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.08)]"
														: "",
												].join(" ")}
												onClick={
													isActions
														? (e) => e.stopPropagation()
														: undefined
												}
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</td>
										);
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<p className="text-center text-sm text-muted">
				{t("campaigns.pagination.showing", {
					shown: Math.min(visibleCount, totalCount),
					total: totalCount,
				})}
			</p>
			{hasMore ? (
				<div
					ref={sentinelRef}
					className="h-4 w-full"
					aria-hidden="true"
				/>
			) : null}
		</>
	);
};

export default CampaignsTable;

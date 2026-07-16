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
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ErrorState from "../../../components/dashboard/ErrorState";
import {
	formatInteger,
	formatMoney,
	formatRatio,
	formatRoi,
	roiToneClass,
} from "../utils/reportFormatters";
import ReportsEmptyState from "./ReportsEmptyState";

const INITIAL_VISIBLE = 20;
const CHUNK_SIZE = 20;

function SortIcon({ column }) {
	const sorted = column.getIsSorted();
	if (sorted === "asc")
		return <ArrowUp className="size-3.5" aria-hidden="true" />;
	if (sorted === "desc")
		return <ArrowDown className="size-3.5" aria-hidden="true" />;
	return <ArrowUpDown className="size-3.5 opacity-40" aria-hidden="true" />;
}

const TableSkeleton = () => (
	<div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
		<div className="space-y-3">
			{Array.from({ length: 6 }).map((_, index) => (
				<div
					key={index}
					className="h-12 animate-pulse rounded-xl border border-border/60 bg-border/40"
				/>
			))}
		</div>
	</div>
);

const CampaignEvaluationTable = ({
	rows,
	isLoading,
	isError,
	onRetry,
	hasFilters = false,
}) => {
	const { t } = useTranslation();
	const [sorting, setSorting] = useState([]);
	const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
	const sentinelRef = useRef(null);

	useEffect(() => {
		setVisibleCount(INITIAL_VISIBLE);
	}, [rows]);

	const columns = useMemo(
		() => [
			{
				accessorKey: "name",
				header: t("reports.campaigns.columns.campaign"),
				cell: ({ row }) => (
					<div className="min-w-0">
						<p className="font-medium text-text">
							{row.original.name ?? "—"}
						</p>
						<p className="text-xs text-muted">
							#{row.original.campaign_id}
						</p>
					</div>
				),
			},
			{
				accessorKey: "spent",
				header: t("reports.campaigns.columns.spent"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm text-text">
						{formatMoney(getValue())}
					</span>
				),
			},
			{
				accessorKey: "revenue",
				header: t("reports.campaigns.columns.revenue"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm text-text">
						{formatMoney(getValue())}
					</span>
				),
			},
			{
				accessorKey: "leads",
				header: t("reports.campaigns.columns.leads"),
				cell: ({ getValue }) => (
					<span className="text-sm text-text">{formatInteger(getValue())}</span>
				),
			},
			{
				accessorKey: "qualified_leads",
				header: t("reports.campaigns.columns.qualified"),
				cell: ({ getValue }) => (
					<span className="text-sm text-text">{formatInteger(getValue())}</span>
				),
			},
			{
				accessorKey: "converted_leads",
				header: t("reports.campaigns.columns.converted"),
				cell: ({ getValue }) => (
					<span className="text-sm text-text">{formatInteger(getValue())}</span>
				),
			},
			{
				accessorKey: "cpl",
				header: t("reports.campaigns.columns.cpl"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm text-muted">
						{formatMoney(getValue())}
					</span>
				),
			},
			{
				accessorKey: "cpql",
				header: t("reports.campaigns.columns.cpql"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm text-muted">
						{formatMoney(getValue())}
					</span>
				),
			},
			{
				accessorKey: "cpc",
				header: t("reports.campaigns.columns.cpc"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm text-muted">
						{formatMoney(getValue())}
					</span>
				),
			},
			{
				accessorKey: "roas",
				header: t("reports.campaigns.columns.roas"),
				cell: ({ getValue }) => (
					<span className="text-sm text-text">{formatRatio(getValue())}</span>
				),
			},
			{
				accessorKey: "roi",
				header: t("reports.campaigns.columns.roi"),
				cell: ({ getValue }) => (
					<span
						className={`whitespace-nowrap text-sm font-medium ${roiToneClass(getValue())}`}
					>
						{formatRoi(getValue())}
					</span>
				),
			},
		],
		[t],
	);

	const table = useReactTable({
		data: rows ?? [],
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getRowId: (row) => String(row.campaign_id),
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
					message={t("reports.errors.loadFailed")}
					onRetry={onRetry}
				/>
			</section>
		);
	}

	if (!rows?.length) {
		return <ReportsEmptyState filtered={hasFilters} />;
	}

	return (
		<>
			<section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
				<div className="overflow-x-auto">
					<table className="min-w-full text-start text-sm">
						<thead className="bg-background/80 text-xs font-semibold uppercase tracking-wide text-muted">
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<th key={header.id} className="px-4 py-3 text-start">
											{header.column.getCanSort() ? (
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
									))}
								</tr>
							))}
						</thead>
						<tbody className="divide-y divide-border bg-surface">
							{visibleRows.map((row) => (
								<tr
									key={row.id}
									className="transition-colors hover:bg-background/70"
								>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id} className="px-4 py-3 align-middle">
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<p className="text-center text-sm text-muted">
				{t("reports.pagination.showing", {
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

export default CampaignEvaluationTable;

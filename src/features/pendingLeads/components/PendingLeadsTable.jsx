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
	Replace,
	Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ErrorState from "../../../components/dashboard/ErrorState";
import DuplicateStatusBadge from "../../../components/ui/DuplicateStatusBadge";
import {
	getAvatarTone,
	getInitials,
} from "../../leads/utils/leadAvatars";
import {
	getDuplicateType,
} from "../utils/pendingLeadConstants";
import PendingLeadEmptyState from "./PendingLeadEmptyState";

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

function SortIcon({ column }) {
	const sorted = column.getIsSorted();
	if (sorted === "asc") {
		return <ArrowUp className="size-3.5" aria-hidden="true" />;
	}
	if (sorted === "desc") {
		return <ArrowDown className="size-3.5" aria-hidden="true" />;
	}
	return <ArrowUpDown className="size-3.5 opacity-40" aria-hidden="true" />;
}

function DuplicateTypeBadge({ lead }) {
	const { t } = useTranslation();
	const type = getDuplicateType(lead);
	if (!type) return <span className="text-sm text-muted">—</span>;

	const styles =
		type === "existing_lead"
			? "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200"
			: "bg-violet-50 text-violet-800 ring-1 ring-inset ring-violet-200";

	return (
		<span
			className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}
		>
			{t(`pendingLeads.duplicateType.${type}`)}
		</span>
	);
}

function ActionButtons({
	lead,
	actionsDisabled,
	onReplace,
	onRemove,
	compact = false,
}) {
	const { t } = useTranslation();
	const btn =
		"inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

	return (
		<div
			className={`flex flex-wrap items-center ${compact ? "justify-end gap-1" : "gap-1"}`}
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
		>
			<button
				type="button"
				disabled={actionsDisabled || lead.duplicate_status !== "pending"}
				onClick={() => onReplace(lead)}
				className={`${btn} text-blue-700 hover:bg-blue-50`}
			>
				<Replace className="size-3.5" aria-hidden="true" />
				{t("pendingLeads.actions.replace")}
			</button>
			<button
				type="button"
				disabled={actionsDisabled || lead.duplicate_status !== "pending"}
				onClick={() => onRemove(lead)}
				className={`${btn} text-red-600 hover:bg-red-50`}
			>
				<Trash2 className="size-3.5" aria-hidden="true" />
				{t("pendingLeads.actions.remove")}
			</button>
		</div>
	);
}

const PendingLeadsTableSkeleton = () => (
	<div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
		<div className="mb-4 hidden gap-4 md:grid md:grid-cols-5">
			{Array.from({ length: 5 }).map((_, i) => (
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

const PendingLeadsTable = ({
	leads,
	isLoading,
	isError,
	onRetry,
	isFilteredEmpty = false,
	sorting,
	onSortingChange,
	actionsDisabled = false,
	onView,
	onReplace,
	onRemove,
}) => {
	const { t } = useTranslation();
	const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
	const sentinelRef = useRef(null);

	useEffect(() => {
		setVisibleCount(INITIAL_VISIBLE);
	}, [leads]);

	const columns = useMemo(
		() => [
			{
				accessorKey: "name",
				id: "lead",
				header: t("pendingLeads.columns.lead"),
				cell: ({ row }) => {
					const lead = row.original;
					return (
						<div className="flex min-w-0 items-center gap-3">
							<span
								className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarTone(lead.name)}`}
							>
								{getInitials(lead.name)}
							</span>
							<div className="min-w-0">
								<p className="truncate font-medium text-text">
									{lead.name ?? "—"}
								</p>
								<p className="truncate text-xs text-muted">
									{lead.email ?? "—"}
								</p>
							</div>
						</div>
					);
				},
			},
			{
				accessorKey: "phone",
				header: t("pendingLeads.columns.phone"),
				cell: ({ getValue }) => (
					<span className="text-sm text-text" dir="ltr">
						{getValue() || "—"}
					</span>
				),
			},
			{
				id: "duplicateType",
				accessorFn: (row) => getDuplicateType(row) ?? "",
				header: t("pendingLeads.columns.duplicateType"),
				cell: ({ row }) => <DuplicateTypeBadge lead={row.original} />,
			},
			{
				accessorKey: "duplicate_reason",
				header: t("pendingLeads.columns.duplicateReason"),
				cell: ({ getValue }) => {
					const reason = getValue() || "—";
					return (
						<p
							className="max-w-[14rem] truncate text-sm text-muted"
							title={typeof reason === "string" ? reason : undefined}
						>
							{reason}
						</p>
					);
				},
			},
			{
				accessorKey: "duplicate_status",
				header: t("pendingLeads.columns.status"),
				cell: ({ getValue }) => (
					<DuplicateStatusBadge status={getValue()} />
				),
			},
			{
				accessorKey: "created_at",
				header: t("pendingLeads.columns.created"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm text-muted">
						{formatDate(getValue())}
					</span>
				),
			},
			{
				id: "actions",
				enableSorting: false,
				header: t("pendingLeads.columns.actions"),
				cell: ({ row }) => (
					<ActionButtons
						lead={row.original}
						actionsDisabled={actionsDisabled}
						onReplace={onReplace}
						onRemove={onRemove}
					/>
				),
			},
		],
		[
			t,
			actionsDisabled,
			onView,
			onReplace,
			onRemove,
		],
	);

	const table = useReactTable({
		data: leads ?? [],
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

	if (isLoading) {
		return <PendingLeadsTableSkeleton />;
	}

	if (isError) {
		return (
			<section className="rounded-2xl border border-border bg-surface shadow-sm">
				<ErrorState
					message={t("pendingLeads.errors.loadFailed")}
					onRetry={onRetry}
				/>
			</section>
		);
	}

	if (!leads?.length) {
		return <PendingLeadEmptyState filtered={isFilteredEmpty} />;
	}

	return (
		<>
			{/* Mobile cards */}
			<div className="rounded-2xl border border-border bg-surface shadow-sm md:hidden">
				{visibleRows.map((row) => {
					const lead = row.original;
					const isPending = lead.duplicate_status === "pending";
					return (
						<article
							key={row.id}
							className={[
								"border-b border-border px-4 py-4 last:border-b-0",
								isPending ? "border-s-2 border-s-amber-400/60 bg-amber-50/30" : "",
							].join(" ")}
						>
							<div className="flex items-start gap-3">
								<button
									type="button"
									className="flex min-w-0 flex-1 items-start gap-3 text-start"
									onClick={() => onView(lead)}
								>
									<span
										className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarTone(lead.name)}`}
									>
										{getInitials(lead.name)}
									</span>
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-2">
											<p className="font-medium text-text">
												{lead.name ?? "—"}
											</p>
											<DuplicateStatusBadge status={lead.duplicate_status} />
										</div>
										<p className="mt-1 text-xs text-muted" dir="ltr">
											{lead.phone ?? "—"}
											{lead.email ? ` · ${lead.email}` : ""}
										</p>
										<div className="mt-2 flex flex-wrap gap-2">
											<DuplicateTypeBadge lead={lead} />
										</div>
										<p
											className="mt-2 truncate text-xs text-muted"
											title={lead.duplicate_reason ?? undefined}
										>
											{lead.duplicate_reason ?? "—"}
										</p>
									</div>
								</button>
							</div>
							<div className="mt-3 border-t border-border/60 pt-3">
								<ActionButtons
									lead={lead}
									actionsDisabled={actionsDisabled}
									onReplace={onReplace}
									onRemove={onRemove}
									compact
								/>
							</div>
						</article>
					);
				})}
			</div>

			{/* Desktop table */}
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
							{visibleRows.map((row) => {
								const lead = row.original;
								const isPending = lead.duplicate_status === "pending";
								return (
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
										className={[
											"cursor-pointer transition-colors hover:bg-background/70",
											isPending
												? "border-s-2 border-s-amber-400/60 bg-amber-50/20"
												: "",
										].join(" ")}
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
								);
							})}
						</tbody>
					</table>
				</div>
			</section>

			<p className="text-center text-sm text-muted">
				{t("pendingLeads.pagination.showing", {
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

export default PendingLeadsTable;

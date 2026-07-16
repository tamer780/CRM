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
	getAvatarTone,
	getInitials,
} from "../../leads/utils/leadAvatars";
import { shortModelName } from "../utils/auditLogConstants";
import AuditLogEmptyState from "./AuditLogEmptyState";

const INITIAL_VISIBLE = 20;
const CHUNK_SIZE = 20;

function formatDateTime(value) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function SortIcon({ column }) {
	const sorted = column.getIsSorted();
	if (sorted === "asc")
		return <ArrowUp className="size-3.5" aria-hidden="true" />;
	if (sorted === "desc")
		return <ArrowDown className="size-3.5" aria-hidden="true" />;
	return <ArrowUpDown className="size-3.5 opacity-40" aria-hidden="true" />;
}

function UserCell({ usersMap, userId }) {
	if (userId == null || userId === "" || Number(userId) === 0) {
		return <span className="text-sm text-muted">—</span>;
	}
	const user =
		usersMap?.get(Number(userId)) ?? usersMap?.get(String(userId));
	const name = user
		? (user.name ?? user.email ?? `#${user.id}`)
		: `#${userId}`;
	return (
		<div className="flex min-w-0 items-center gap-2">
			<span
				className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${getAvatarTone(name)}`}
			>
				{getInitials(name)}
			</span>
			<span className="truncate text-sm text-text">{name}</span>
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
					<div className="h-3.5 w-1/3 animate-pulse rounded bg-border/80" />
					<div className="h-3 w-1/4 animate-pulse rounded bg-border/50" />
				</div>
			))}
		</div>
	</div>
);

const AuditLogsTable = ({
	logs,
	isLoading,
	isError,
	onRetry,
	isFilteredEmpty = false,
	usersMap,
	sorting,
	onSortingChange,
	onView,
}) => {
	const { t } = useTranslation();
	const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
	const sentinelRef = useRef(null);

	useEffect(() => {
		setVisibleCount(INITIAL_VISIBLE);
	}, [logs]);

	const columns = useMemo(
		() => [
			{
				accessorKey: "action",
				id: "action",
				header: t("auditLogs.columns.action"),
				cell: ({ getValue }) => (
					<span className="inline-flex rounded-full bg-light-gold/70 px-2.5 py-0.5 font-mono text-xs font-medium text-primary">
						{getValue() || "—"}
					</span>
				),
			},
			{
				id: "model",
				accessorFn: (row) => shortModelName(row.auditable_type),
				header: t("auditLogs.columns.model"),
				cell: ({ row }) => {
					const model = shortModelName(row.original.auditable_type);
					const id = row.original.auditable_id;
					if (!model) return <span className="text-sm text-muted">—</span>;
					return (
						<span className="text-sm text-text">
							{model}
							{id != null ? (
								<span className="text-muted"> #{id}</span>
							) : null}
						</span>
					);
				},
			},
			{
				id: "user",
				accessorFn: (row) => {
					const user =
						usersMap?.get(Number(row.user_id)) ??
						usersMap?.get(String(row.user_id));
					return user?.name ?? user?.email ?? String(row.user_id ?? "");
				},
				header: t("auditLogs.columns.user"),
				cell: ({ row }) => (
					<UserCell usersMap={usersMap} userId={row.original.user_id} />
				),
			},
			{
				accessorKey: "ip_address",
				id: "ip",
				header: t("auditLogs.columns.ip"),
				cell: ({ getValue }) => (
					<span className="font-mono text-sm text-muted">
						{getValue() || "—"}
					</span>
				),
			},
			{
				accessorKey: "created_at",
				id: "created",
				header: t("auditLogs.columns.created"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm text-muted">
						{formatDateTime(getValue())}
					</span>
				),
			},
		],
		[t, usersMap],
	);

	const table = useReactTable({
		data: logs ?? [],
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
					message={t("auditLogs.errors.loadFailed")}
					onRetry={onRetry}
				/>
			</section>
		);
	}

	if (!logs?.length) {
		return <AuditLogEmptyState filtered={isFilteredEmpty} />;
	}

	return (
		<>
			<div className="rounded-2xl border border-border bg-surface shadow-sm md:hidden">
				{visibleRows.map((row) => {
					const log = row.original;
					const model = shortModelName(log.auditable_type);
					return (
						<article
							key={row.id}
							className="border-b border-border px-4 py-4 last:border-b-0"
						>
							<button
								type="button"
								className="w-full min-w-0 text-start"
								onClick={() => onView(log)}
							>
								<span className="inline-flex rounded-full bg-light-gold/70 px-2.5 py-0.5 font-mono text-xs font-medium text-primary">
									{log.action}
								</span>
								{model && (
									<p className="mt-2 text-sm text-text">
										{model}
										{log.auditable_id != null ? (
											<span className="text-muted"> #{log.auditable_id}</span>
										) : null}
									</p>
								)}
								<p className="mt-1 text-xs text-muted">
									{formatDateTime(log.created_at)}
								</p>
							</button>
						</article>
					);
				})}
			</div>

			<section className="hidden overflow-hidden rounded-2xl border border-border bg-surface shadow-sm md:block">
				<div className="overflow-x-auto">
					<table className="min-w-full text-start text-sm">
						<thead className="bg-background/80 text-xs font-semibold uppercase tracking-wide text-muted">
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<th key={header.id} className="px-4 py-3 text-start">
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
									))}
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
				{t("auditLogs.pagination.showing", {
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

export default AuditLogsTable;

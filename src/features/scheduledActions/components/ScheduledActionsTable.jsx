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
	CheckCircle2,
	Pencil,
	Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ErrorState from "../../../components/dashboard/ErrorState";
import {
	getAvatarTone,
	getInitials,
} from "../../leads/utils/leadAvatars";
import { SCHEDULED_ACTION_STATUS_STYLES } from "../utils/scheduledActionConstants";
import ScheduledActionEmptyState from "./ScheduledActionEmptyState";

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

function StatusBadge({ status, t }) {
	const style =
		SCHEDULED_ACTION_STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600";
	return (
		<span
			className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
		>
			{t(`scheduledActions.statuses.${status}`, { defaultValue: status })}
		</span>
	);
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

function RelatedCell({ action, leadsMap, clientsMap, t }) {
	if (action.lead_id != null && Number(action.lead_id) !== 0) {
		const lead =
			leadsMap?.get(Number(action.lead_id)) ??
			leadsMap?.get(String(action.lead_id));
		const name = lead?.name ?? lead?.phone ?? `#${action.lead_id}`;
		return (
			<div className="min-w-0">
				<p className="text-[10px] font-medium uppercase tracking-wide text-muted">
					{t("scheduledActions.form.relatedTypes.lead")}
				</p>
				<p className="truncate text-sm text-text">{name}</p>
			</div>
		);
	}
	if (action.client_id != null && Number(action.client_id) !== 0) {
		const client =
			clientsMap?.get(Number(action.client_id)) ??
			clientsMap?.get(String(action.client_id));
		const name = client?.name ?? client?.phone ?? `#${action.client_id}`;
		return (
			<div className="min-w-0">
				<p className="text-[10px] font-medium uppercase tracking-wide text-muted">
					{t("scheduledActions.form.relatedTypes.client")}
				</p>
				<p className="truncate text-sm text-text">{name}</p>
			</div>
		);
	}
	return <span className="text-sm text-muted">—</span>;
}

function ActionButtons({
	action,
	actionsDisabled,
	onEdit,
	onComplete,
	onDelete,
}) {
	const { t } = useTranslation();
	const canComplete = action.status !== "completed";
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
				onClick={() => onEdit(action)}
				className={`${btn} text-primary hover:bg-light-gold/60`}
			>
				<Pencil className="size-3.5" aria-hidden="true" />
				{t("scheduledActions.actions.edit")}
			</button>
			{canComplete && (
				<button
					type="button"
					disabled={actionsDisabled}
					onClick={() => onComplete(action)}
					className={`${btn} text-emerald-700 hover:bg-emerald-50`}
				>
					<CheckCircle2 className="size-3.5" aria-hidden="true" />
					{t("scheduledActions.actions.complete")}
				</button>
			)}
			<button
				type="button"
				disabled={actionsDisabled}
				onClick={() => onDelete(action)}
				className={`${btn} text-red-600 hover:bg-red-50`}
			>
				<Trash2 className="size-3.5" aria-hidden="true" />
				{t("scheduledActions.actions.delete")}
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
					<div className="size-10 animate-pulse rounded-full bg-border/70" />
					<div className="min-w-0 flex-1 space-y-2">
						<div className="h-3.5 w-1/3 animate-pulse rounded bg-border/80" />
						<div className="h-3 w-1/4 animate-pulse rounded bg-border/50" />
					</div>
				</div>
			))}
		</div>
	</div>
);

const ScheduledActionsTable = ({
	actions,
	isLoading,
	isError,
	onRetry,
	isFilteredEmpty = false,
	usersMap,
	leadsMap,
	clientsMap,
	sorting,
	onSortingChange,
	actionsDisabled = false,
	onView,
	onEdit,
	onComplete,
	onDelete,
	onCreate,
}) => {
	const { t } = useTranslation();
	const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
	const sentinelRef = useRef(null);

	useEffect(() => {
		setVisibleCount(INITIAL_VISIBLE);
	}, [actions]);

	const columns = useMemo(
		() => [
			{
				accessorKey: "type",
				id: "type",
				header: t("scheduledActions.columns.type"),
				cell: ({ row }) => (
					<span className="inline-flex rounded-full bg-light-gold/70 px-2.5 py-0.5 text-xs font-medium capitalize text-primary">
						{t(`scheduledActions.types.${row.original.type}`, {
							defaultValue: row.original.type,
						})}
					</span>
				),
			},
			{
				id: "related",
				enableSorting: false,
				header: t("scheduledActions.columns.related"),
				cell: ({ row }) => (
					<RelatedCell
						action={row.original}
						leadsMap={leadsMap}
						clientsMap={clientsMap}
						t={t}
					/>
				),
			},
			{
				id: "assignee",
				accessorFn: (row) => {
					const user =
						usersMap?.get(Number(row.assigned_to)) ??
						usersMap?.get(String(row.assigned_to));
					return user?.name ?? user?.email ?? String(row.assigned_to ?? "");
				},
				header: t("scheduledActions.columns.assignee"),
				cell: ({ row }) => (
					<UserCell usersMap={usersMap} userId={row.original.assigned_to} />
				),
			},
			{
				accessorKey: "scheduled_at",
				id: "scheduled",
				header: t("scheduledActions.columns.scheduledAt"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm text-muted">
						{formatDateTime(getValue())}
					</span>
				),
			},
			{
				accessorKey: "status",
				id: "status",
				header: t("scheduledActions.columns.status"),
				cell: ({ row }) => (
					<StatusBadge status={row.original.status} t={t} />
				),
			},
			{
				accessorKey: "note",
				id: "note",
				header: t("scheduledActions.columns.note"),
				cell: ({ getValue }) => (
					<span className="line-clamp-2 max-w-[14rem] text-sm text-muted">
						{getValue() || "—"}
					</span>
				),
			},
			{
				id: "actions",
				enableSorting: false,
				header: t("scheduledActions.columns.actions"),
				cell: ({ row }) => (
					<ActionButtons
						action={row.original}
						actionsDisabled={actionsDisabled}
						onEdit={onEdit}
						onComplete={onComplete}
						onDelete={onDelete}
					/>
				),
			},
		],
		[
			t,
			usersMap,
			leadsMap,
			clientsMap,
			actionsDisabled,
			onView,
			onEdit,
			onComplete,
			onDelete,
		],
	);

	const table = useReactTable({
		data: actions ?? [],
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
					message={t("scheduledActions.errors.loadFailed")}
					onRetry={onRetry}
				/>
			</section>
		);
	}

	if (!actions?.length) {
		return (
			<ScheduledActionEmptyState filtered={isFilteredEmpty} onCreate={onCreate} />
		);
	}

	return (
		<>
			<div className="rounded-2xl border border-border bg-surface shadow-sm md:hidden">
				{visibleRows.map((row) => {
					const action = row.original;
					return (
						<article
							key={row.id}
							className="border-b border-border px-4 py-4 last:border-b-0"
						>
							<div className="flex items-start gap-3">
								<button
									type="button"
									className="min-w-0 flex-1 text-start"
									onClick={() => onView(action)}
								>
									<div className="flex flex-wrap items-center gap-2">
										<span className="inline-flex rounded-full bg-light-gold/70 px-2.5 py-0.5 text-xs font-medium capitalize text-primary">
											{t(`scheduledActions.types.${action.type}`, {
												defaultValue: action.type,
											})}
										</span>
										<StatusBadge status={action.status} t={t} />
									</div>
									<div className="mt-3">
										<RelatedCell
											action={action}
											leadsMap={leadsMap}
											clientsMap={clientsMap}
											t={t}
										/>
									</div>
									<p className="mt-2 text-xs text-muted">
										{formatDateTime(action.scheduled_at)}
									</p>
								</button>
							</div>
							<div className="mt-3 border-t border-border/60 pt-3">
								<ActionButtons
									action={action}
									actionsDisabled={actionsDisabled}
									onEdit={onEdit}
									onComplete={onComplete}
									onDelete={onDelete}
								/>
							</div>
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
				{t("scheduledActions.pagination.showing", {
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

export default ScheduledActionsTable;

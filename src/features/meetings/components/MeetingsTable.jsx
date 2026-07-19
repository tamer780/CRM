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
import {
	getAvatarTone,
	getInitials,
} from "../../leads/utils/leadAvatars";
import MeetingEmptyState from "./MeetingEmptyState";
import MeetingStatusSelect from "./MeetingStatusSelect";

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

function UserCell({ user, userId }) {
	if (userId == null || userId === "" || Number(userId) === 0) {
		return <span className="text-sm text-muted">—</span>;
	}
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

function LeadCell({ meeting }) {
	const lead = meeting.lead;
	if (!lead && (meeting.lead_id == null || Number(meeting.lead_id) === 0)) {
		return <span className="text-sm text-muted">—</span>;
	}
	const name = lead?.name ?? lead?.phone ?? `#${meeting.lead_id}`;
	const phone = lead?.phone;
	return (
		<div className="min-w-0">
			<p className="truncate text-sm font-medium text-text">{name}</p>
			{phone && phone !== name ? (
				<p className="truncate text-xs text-muted">{phone}</p>
			) : null}
		</div>
	);
}

function ActionButtons({ meeting, actionsDisabled, onEdit, onDelete }) {
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
				onClick={() => onEdit(meeting)}
				className={`${btn} text-primary hover:bg-light-gold/60`}
			>
				<Pencil className="size-3.5" aria-hidden="true" />
				{t("meetings.actions.edit")}
			</button>
			<button
				type="button"
				disabled={actionsDisabled}
				onClick={() => onDelete(meeting)}
				className={`${btn} text-red-600 hover:bg-red-50`}
			>
				<Trash2 className="size-3.5" aria-hidden="true" />
				{t("meetings.actions.delete")}
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

const MeetingsTable = ({
	meetings,
	isLoading,
	isError,
	onRetry,
	isFilteredEmpty = false,
	sorting,
	onSortingChange,
	actionsDisabled = false,
	updatingMeetingId = null,
	onView,
	onEdit,
	onDelete,
	onStatusChange,
	onCreate,
}) => {
	const { t } = useTranslation();
	const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
	const sentinelRef = useRef(null);

	useEffect(() => {
		setVisibleCount(INITIAL_VISIBLE);
	}, [meetings]);

	const columns = useMemo(
		() => [
			{
				accessorKey: "meeting_date",
				id: "meeting_date",
				header: t("meetings.columns.meetingDate"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm text-muted">
						{formatDateTime(getValue())}
					</span>
				),
			},
			{
				id: "lead",
				enableSorting: false,
				header: t("meetings.columns.lead"),
				cell: ({ row }) => <LeadCell meeting={row.original} />,
			},
			{
				id: "assignee",
				accessorFn: (row) =>
					row.assignee?.name ??
					row.assignee?.email ??
					String(row.assigned_to ?? ""),
				header: t("meetings.columns.assignee"),
				cell: ({ row }) => (
					<UserCell
						user={row.original.assignee}
						userId={row.original.assigned_to}
					/>
				),
			},
			{
				accessorKey: "status",
				id: "status",
				header: t("meetings.columns.status"),
				cell: ({ row }) => (
					<MeetingStatusSelect
						status={row.original.status}
						onChange={(status) => onStatusChange?.(row.original, status)}
						disabled={actionsDisabled}
						isUpdating={
							String(updatingMeetingId) === String(row.original.id)
						}
					/>
				),
			},
			{
				accessorKey: "notes",
				id: "notes",
				header: t("meetings.columns.notes"),
				cell: ({ getValue }) => (
					<span className="line-clamp-2 max-w-[14rem] text-sm text-muted">
						{getValue() || "—"}
					</span>
				),
			},
			{
				id: "creator",
				enableSorting: false,
				header: t("meetings.columns.creator"),
				cell: ({ row }) => (
					<UserCell
						user={row.original.creator}
						userId={row.original.created_by}
					/>
				),
			},
			{
				id: "actions",
				enableSorting: false,
				header: t("meetings.columns.actions"),
				cell: ({ row }) => (
					<ActionButtons
						meeting={row.original}
						actionsDisabled={actionsDisabled}
						onEdit={onEdit}
						onDelete={onDelete}
					/>
				),
			},
		],
		[
			t,
			actionsDisabled,
			updatingMeetingId,
			onEdit,
			onDelete,
			onStatusChange,
		],
	);

	const table = useReactTable({
		data: meetings ?? [],
		columns,
		state: { sorting },
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
					message={t("meetings.errors.loadFailed")}
					onRetry={onRetry}
				/>
			</section>
		);
	}

	if (!meetings?.length) {
		return (
			<MeetingEmptyState filtered={isFilteredEmpty} onCreate={onCreate} />
		);
	}

	return (
		<>
			<div className="rounded-2xl border border-border bg-surface shadow-sm md:hidden">
				{visibleRows.map((row) => {
					const meeting = row.original;
					return (
						<article
							key={row.id}
							className="border-b border-border px-4 py-4 last:border-b-0"
						>
							<div className="flex flex-wrap items-center gap-2">
								<MeetingStatusSelect
									status={meeting.status}
									onChange={(status) =>
										onStatusChange?.(meeting, status)
									}
									disabled={actionsDisabled}
									isUpdating={
										String(updatingMeetingId) === String(meeting.id)
									}
								/>
								<button
									type="button"
									className="text-xs text-muted"
									onClick={() => onView(meeting)}
								>
									{formatDateTime(meeting.meeting_date)}
								</button>
							</div>
							<button
								type="button"
								className="mt-3 w-full text-start"
								onClick={() => onView(meeting)}
							>
								<LeadCell meeting={meeting} />
							</button>
							<div className="mt-3 border-t border-border/60 pt-3">
								<ActionButtons
									meeting={meeting}
									actionsDisabled={actionsDisabled}
									onEdit={onEdit}
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
				{t("meetings.pagination.showing", {
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

export default MeetingsTable;

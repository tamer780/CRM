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
	Power,
	PowerOff,
	Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ErrorState from "../../../components/dashboard/ErrorState";
import {
	getAvatarTone,
	getInitials,
} from "../../leads/utils/leadAvatars";
import { getUserRole, getUserTeamName, isUserActive } from "../utils/userConstants";
import UserEmptyState from "./UserEmptyState";

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
	if (sorted === "asc")
		return <ArrowUp className="size-3.5" aria-hidden="true" />;
	if (sorted === "desc")
		return <ArrowDown className="size-3.5" aria-hidden="true" />;
	return <ArrowUpDown className="size-3.5 opacity-40" aria-hidden="true" />;
}

function StatusBadge({ active, t }) {
	return (
		<span
			className={[
				"inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
				active
					? "bg-emerald-50 text-emerald-700"
					: "bg-red-50 text-red-700",
			].join(" ")}
		>
			{active ? t("users.status.active") : t("users.status.inactive")}
		</span>
	);
}

function ActionButtons({
	user,
	actionsDisabled,
	manageDisabled = false,
	onEdit,
	onToggleActive,
	onDelete,
}) {
	const { t } = useTranslation();
	const active = isUserActive(user);
	const disabled = actionsDisabled || manageDisabled;
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
				disabled={disabled}
				onClick={() => onEdit(user)}
				className={`${btn} text-primary hover:bg-light-gold/60`}
			>
				<Pencil className="size-3.5" aria-hidden="true" />
				{t("users.actions.edit")}
			</button>
			<button
				type="button"
				disabled={disabled}
				onClick={() => onToggleActive(user)}
				className={`${btn} text-text hover:bg-background`}
			>
				{active ? (
					<PowerOff className="size-3.5" aria-hidden="true" />
				) : (
					<Power className="size-3.5" aria-hidden="true" />
				)}
				{active
					? t("users.actions.deactivate")
					: t("users.actions.activate")}
			</button>
			<button
				type="button"
				disabled={disabled}
				onClick={() => onDelete(user)}
				className={`${btn} text-red-600 hover:bg-red-50`}
			>
				<Trash2 className="size-3.5" aria-hidden="true" />
				{t("users.actions.delete")}
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

const UsersTable = ({
	users,
	teams = [],
	isLoading,
	isError,
	onRetry,
	isFilteredEmpty = false,
	sorting,
	onSortingChange,
	actionsDisabled = false,
	canManageUser,
	onView,
	onEdit,
	onToggleActive,
	onDelete,
	onCreate,
}) => {
	const { t } = useTranslation();
	const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
	const sentinelRef = useRef(null);

	useEffect(() => {
		setVisibleCount(INITIAL_VISIBLE);
	}, [users]);

	const columns = useMemo(
		() => [
			{
				accessorKey: "name",
				id: "user",
				header: t("users.columns.user"),
				cell: ({ row }) => {
					const user = row.original;
					const name = user.name ?? user.email ?? "—";
					return (
						<div className="flex min-w-0 items-center gap-3">
							<span
								className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarTone(name)}`}
							>
								{getInitials(name)}
							</span>
							<div className="min-w-0">
								<p className="truncate font-medium text-text">{name}</p>
								{user.email && (
									<p className="truncate text-xs text-muted">{user.email}</p>
								)}
							</div>
						</div>
					);
				},
			},
			{
				id: "role",
				accessorFn: (row) => getUserRole(row),
				header: t("users.columns.role"),
				cell: ({ row }) => {
					const role = getUserRole(row.original);
					if (!role) return <span className="text-sm text-muted">—</span>;
					return (
						<span className="inline-flex rounded-full bg-light-gold/70 px-2.5 py-0.5 text-xs font-medium capitalize text-primary">
							{t(`users.roles.${role}`, { defaultValue: role })}
						</span>
					);
				},
			},
			{
				accessorKey: "phone",
				id: "phone",
				header: t("users.columns.phone"),
				cell: ({ getValue }) => (
					<span className="text-sm text-text">{getValue() || "—"}</span>
				),
			},
			{
				id: "team",
				accessorFn: (row) => getUserTeamName(row, teams),
				header: t("users.columns.team"),
				cell: ({ row }) => (
					<span className="text-sm text-text">
						{getUserTeamName(row.original, teams) || "—"}
					</span>
				),
			},
			{
				accessorKey: "job_title",
				id: "jobTitle",
				header: t("users.columns.jobTitle"),
				cell: ({ getValue }) => (
					<span className="text-sm text-text">{getValue() || "—"}</span>
				),
			},
			{
				id: "status",
				accessorFn: (row) => (isUserActive(row) ? "active" : "inactive"),
				header: t("users.columns.status"),
				cell: ({ row }) => (
					<StatusBadge active={isUserActive(row.original)} t={t} />
				),
			},
			{
				accessorKey: "created_at",
				id: "created",
				header: t("users.columns.created"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm text-muted">
						{formatDate(getValue())}
					</span>
				),
			},
			{
				id: "actions",
				enableSorting: false,
				header: t("users.columns.actions"),
				cell: ({ row }) => (
					<ActionButtons
						user={row.original}
						actionsDisabled={actionsDisabled}
						manageDisabled={
							typeof canManageUser === "function"
								? !canManageUser(row.original)
								: false
						}
						onEdit={onEdit}
						onToggleActive={onToggleActive}
						onDelete={onDelete}
					/>
				),
			},
		],
		[t, teams, actionsDisabled, canManageUser, onEdit, onToggleActive, onDelete],
	);

	const table = useReactTable({
		data: users ?? [],
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
				<ErrorState message={t("users.errors.loadFailed")} onRetry={onRetry} />
			</section>
		);
	}

	if (!users?.length) {
		return <UserEmptyState filtered={isFilteredEmpty} onCreate={onCreate} />;
	}

	return (
		<>
			<div className="rounded-2xl border border-border bg-surface shadow-sm md:hidden">
				{visibleRows.map((row) => {
					const user = row.original;
					const name = user.name ?? user.email ?? "—";
					return (
						<article
							key={row.id}
							className="border-b border-border px-4 py-4 last:border-b-0"
						>
							<div className="flex items-start gap-3">
								<button
									type="button"
									className="min-w-0 flex-1 text-start"
									onClick={() => onView(user)}
								>
									<div className="flex items-center gap-3">
										<span
											className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarTone(name)}`}
										>
											{getInitials(name)}
										</span>
										<div className="min-w-0">
											<p className="font-medium text-text">{name}</p>
											{user.email && (
												<p className="truncate text-xs text-muted">
													{user.email}
												</p>
											)}
										</div>
									</div>
									<div className="mt-3 flex flex-wrap items-center gap-2">
										{getUserRole(user) && (
											<span className="inline-flex rounded-full bg-light-gold/70 px-2.5 py-0.5 text-xs font-medium capitalize text-primary">
												{t(`users.roles.${getUserRole(user)}`, {
													defaultValue: getUserRole(user),
												})}
											</span>
										)}
										<StatusBadge active={isUserActive(user)} t={t} />
									</div>
									{(user.phone || getUserTeamName(user, teams)) && (
										<p className="mt-2 text-xs text-muted">
											{[user.phone, getUserTeamName(user, teams)]
												.filter(Boolean)
												.join(" · ")}
										</p>
									)}
								</button>
							</div>
							<div className="mt-3 border-t border-border/60 pt-3">
								<ActionButtons
									user={user}
									actionsDisabled={actionsDisabled}
									manageDisabled={
										typeof canManageUser === "function"
											? !canManageUser(user)
											: false
									}
									onEdit={onEdit}
									onToggleActive={onToggleActive}
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
				{t("users.pagination.showing", {
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

export default UsersTable;

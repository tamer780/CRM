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
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ErrorState from "../../../components/dashboard/ErrorState";
import InfiniteScrollFooter from "../../../components/ui/InfiniteScrollFooter";
import { useInfiniteScrollSentinel } from "../../../hooks/ui/useInfiniteScrollSentinel";
import {
	getAvatarTone,
	getInitials,
} from "../../leads/utils/leadAvatars";
import {
	getTeamMembers,
	getTeamProjects,
	personDisplayName,
	resolveTeamPerson,
} from "../utils/teamConstants";
import TeamEmptyState from "./TeamEmptyState";

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

function UserCell({ person }) {
	const name = personDisplayName(person);
	if (!name) {
		return <span className="text-sm text-muted">—</span>;
	}
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

function ActionButtons({
	team,
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
				onClick={() => onEdit(team)}
				className={`${btn} text-primary hover:bg-light-gold/60`}
			>
				<Pencil className="size-3.5" aria-hidden="true" />
				{t("teams.actions.edit")}
			</button>
			<button
				type="button"
				disabled={actionsDisabled}
				onClick={() => onDelete(team)}
				className={`${btn} text-red-600 hover:bg-red-50`}
			>
				<Trash2 className="size-3.5" aria-hidden="true" />
				{t("teams.actions.delete")}
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

const TeamsTable = ({
	teams,
	isLoading,
	isError,
	onRetry,
	isFilteredEmpty = false,
	usersMap,
	sorting,
	onSortingChange,
	actionsDisabled = false,
	onView,
	onEdit,
	onDelete,
	onCreate,
	hasNextPage = false,
	isFetchingNextPage = false,
	fetchNextPage,
	serverTotal,
}) => {
	const { t } = useTranslation();
	const sentinelRef = useInfiniteScrollSentinel({
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	});

	const columns = useMemo(
		() => [
			{
				accessorKey: "name",
				id: "team",
				header: t("teams.columns.team"),
				cell: ({ row }) => {
					const team = row.original;
					const name = team.name ?? "—";
					return (
						<div className="flex min-w-0 items-center gap-3">
							<span
								className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarTone(name)}`}
							>
								{getInitials(name)}
							</span>
							<p className="truncate font-medium text-text">{name}</p>
						</div>
					);
				},
			},
			{
				id: "leader",
				accessorFn: (row) => {
					const person = resolveTeamPerson(
						row,
						"team_leader",
						"team_leader_id",
						usersMap,
					);
					return personDisplayName(person) ?? "";
				},
				header: t("teams.columns.leader"),
				cell: ({ row }) => (
					<UserCell
						person={resolveTeamPerson(
							row.original,
							"team_leader",
							"team_leader_id",
							usersMap,
						)}
					/>
				),
			},
			{
				id: "supervisor",
				accessorFn: (row) => {
					const person = resolveTeamPerson(
						row,
						"supervisor",
						"supervisor_id",
						usersMap,
					);
					return personDisplayName(person) ?? "";
				},
				header: t("teams.columns.supervisor"),
				cell: ({ row }) => (
					<UserCell
						person={resolveTeamPerson(
							row.original,
							"supervisor",
							"supervisor_id",
							usersMap,
						)}
					/>
				),
			},
			{
				id: "members",
				accessorFn: (row) => getTeamMembers(row).length,
				header: t("teams.columns.members"),
				cell: ({ getValue }) => (
					<span className="text-sm tabular-nums text-text">{getValue()}</span>
				),
			},
			{
				id: "projects",
				accessorFn: (row) => getTeamProjects(row).length,
				header: t("teams.columns.projects"),
				cell: ({ getValue }) => (
					<span className="text-sm tabular-nums text-text">{getValue()}</span>
				),
			},
			{
				accessorKey: "created_at",
				id: "created",
				header: t("teams.columns.created"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm text-muted">
						{formatDate(getValue())}
					</span>
				),
			},
			{
				accessorKey: "updated_at",
				id: "updated",
				header: t("teams.columns.updated"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm text-muted">
						{formatDate(getValue())}
					</span>
				),
			},
			{
				id: "actions",
				enableSorting: false,
				header: t("teams.columns.actions"),
				cell: ({ row }) => (
					<ActionButtons
						team={row.original}
						actionsDisabled={actionsDisabled}
						onEdit={onEdit}
						onDelete={onDelete}
					/>
				),
			},
		],
		[t, usersMap, actionsDisabled, onEdit, onDelete],
	);

	const table = useReactTable({
		data: teams ?? [],
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
	const visibleRows = allRows;
	const totalFromServer = serverTotal ?? totalCount;

	if (isLoading) return <TableSkeleton />;

	if (isError) {
		return (
			<section className="rounded-2xl border border-border bg-surface shadow-sm">
				<ErrorState message={t("teams.errors.loadFailed")} onRetry={onRetry} />
			</section>
		);
	}

	if (!teams?.length) {
		return <TeamEmptyState filtered={isFilteredEmpty} onCreate={onCreate} />;
	}

	return (
		<>
			<div className="rounded-2xl border border-border bg-surface shadow-sm md:hidden">
				{visibleRows.map((row) => {
					const team = row.original;
					const leader = resolveTeamPerson(
						team,
						"team_leader",
						"team_leader_id",
						usersMap,
					);
					const supervisor = resolveTeamPerson(
						team,
						"supervisor",
						"supervisor_id",
						usersMap,
					);
					const memberCount = getTeamMembers(team).length;
					const projectCount = getTeamProjects(team).length;

					return (
						<article
							key={row.id}
							className="border-b border-border px-4 py-4 last:border-b-0"
						>
							<div className="flex items-start gap-3">
								<button
									type="button"
									className="min-w-0 flex-1 text-start"
									onClick={() => onView(team)}
								>
									<div className="flex items-center gap-3">
										<span
											className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarTone(team.name)}`}
										>
											{getInitials(team.name)}
										</span>
										<p className="font-medium text-text">{team.name ?? "—"}</p>
									</div>
									<div className="mt-3 space-y-2">
										<UserCell person={leader} />
										<UserCell person={supervisor} />
									</div>
									<p className="mt-3 text-xs text-muted">
										{t("teams.columns.members")}: {memberCount}
										{" · "}
										{t("teams.columns.projects")}: {projectCount}
									</p>
								</button>
							</div>
							<div className="mt-3 border-t border-border/60 pt-3">
								<ActionButtons
									team={team}
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

			<InfiniteScrollFooter
				shown={totalCount}
				total={totalFromServer}
				hasNextPage={hasNextPage}
				isFetchingNextPage={isFetchingNextPage}
				sentinelRef={sentinelRef}
				showingKey="teams.pagination.showing"
				loadingMoreKey="teams.pagination.loadingMore"
				endKey="teams.pagination.end"
			/>
		</>
	);
};

export default TeamsTable;

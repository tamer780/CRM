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
	FileUp,
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
import ProjectEmptyState from "./ProjectEmptyState";
import ProjectStatusBadge from "./ProjectStatusBadge";

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

function TeamsCell({ teams }) {
	const list = teams ?? [];
	if (!list.length) {
		return <span className="text-sm text-muted">—</span>;
	}
	const shown = list.slice(0, 3);
	const rest = list.length - shown.length;
	return (
		<div className="flex items-center gap-1.5">
			<div className="flex -space-x-2 rtl:space-x-reverse">
				{shown.map((team) => {
					const name = team.name ?? `#${team.id}`;
					return (
						<span
							key={team.id}
							title={name}
							className={`flex size-7 items-center justify-center rounded-full text-[10px] font-semibold ring-2 ring-surface ${getAvatarTone(name)}`}
						>
							{getInitials(name)}
						</span>
					);
				})}
			</div>
			<span className="text-xs text-muted">
				{rest > 0 ? `+${rest}` : list.length === 1 ? list[0].name : `${list.length}`}
			</span>
		</div>
	);
}

function CreatedByCell({ usersMap, createdBy }) {
	const user =
		usersMap?.get(Number(createdBy)) ?? usersMap?.get(String(createdBy));
	if (!user) {
		return (
			<span className="text-sm text-muted">
				{createdBy != null ? `#${createdBy}` : "—"}
			</span>
		);
	}
	const name = user.name ?? user.email ?? `#${user.id}`;
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
	project,
	actionsDisabled,
	onEdit,
	onImport,
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
				onClick={() => onEdit(project)}
				className={`${btn} text-primary hover:bg-light-gold/60`}
			>
				<Pencil className="size-3.5" aria-hidden="true" />
				{t("projects.actions.edit")}
			</button>
			<button
				type="button"
				disabled={actionsDisabled}
				onClick={() => onImport(project)}
				className={`${btn} text-accent hover:bg-background`}
			>
				<FileUp className="size-3.5" aria-hidden="true" />
				{t("projects.actions.import")}
			</button>
			<button
				type="button"
				disabled={actionsDisabled}
				onClick={() => onDelete(project)}
				className={`${btn} text-red-600 hover:bg-red-50`}
			>
				<Trash2 className="size-3.5" aria-hidden="true" />
				{t("projects.actions.delete")}
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
						<div className="h-3 w-1/2 animate-pulse rounded bg-border/50" />
					</div>
					<div className="h-6 w-20 animate-pulse rounded-full bg-border/50" />
				</div>
			))}
		</div>
	</div>
);

const ProjectsTable = ({
	projects,
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
	onImport,
	onDelete,
	onCreate,
}) => {
	const { t } = useTranslation();
	const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
	const sentinelRef = useRef(null);

	useEffect(() => {
		setVisibleCount(INITIAL_VISIBLE);
	}, [projects]);

	const columns = useMemo(
		() => [
			{
				accessorKey: "name",
				id: "project",
				header: t("projects.columns.project"),
				cell: ({ row }) => {
					const p = row.original;
					return (
						<div className="min-w-[12rem] max-w-xs">
							<p className="font-medium text-text">{p.name ?? "—"}</p>
							{p.description && (
								<p className="mt-0.5 line-clamp-2 text-xs text-muted">
									{p.description}
								</p>
							)}
						</div>
					);
				},
			},
			{
				accessorKey: "status",
				header: t("projects.columns.status"),
				cell: ({ getValue }) => <ProjectStatusBadge status={getValue()} />,
			},
			{
				id: "teams",
				accessorFn: (row) => (row.teams ?? []).map((t) => t.name).join(", "),
				header: t("projects.columns.teams"),
				cell: ({ row }) => <TeamsCell teams={row.original.teams} />,
			},
			{
				accessorKey: "started_at",
				id: "started",
				header: t("projects.columns.started"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm text-muted">
						{formatDate(getValue())}
					</span>
				),
			},
			{
				id: "createdBy",
				accessorFn: (row) => {
					const user =
						usersMap?.get(Number(row.created_by)) ??
						usersMap?.get(String(row.created_by));
					return user?.name ?? user?.email ?? String(row.created_by ?? "");
				},
				header: t("projects.columns.createdBy"),
				cell: ({ row }) => (
					<CreatedByCell
						usersMap={usersMap}
						createdBy={row.original.created_by}
					/>
				),
			},
			{
				accessorKey: "created_at",
				id: "created",
				header: t("projects.columns.created"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm text-muted">
						{formatDate(getValue())}
					</span>
				),
			},
			{
				id: "actions",
				enableSorting: false,
				header: t("projects.columns.actions"),
				cell: ({ row }) => (
					<ActionButtons
						project={row.original}
						actionsDisabled={actionsDisabled}
						onEdit={onEdit}
						onImport={onImport}
						onDelete={onDelete}
					/>
				),
			},
		],
		[t, usersMap, actionsDisabled, onEdit, onImport, onDelete],
	);

	const table = useReactTable({
		data: projects ?? [],
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
					message={t("projects.errors.loadFailed")}
					onRetry={onRetry}
				/>
			</section>
		);
	}

	if (!projects?.length) {
		return (
			<ProjectEmptyState filtered={isFilteredEmpty} onCreate={onCreate} />
		);
	}

	return (
		<>
			<div className="rounded-2xl border border-border bg-surface shadow-sm md:hidden">
				{visibleRows.map((row) => {
					const project = row.original;
					return (
						<article
							key={row.id}
							className="border-b border-border px-4 py-4 last:border-b-0"
						>
							<div className="flex items-start gap-3">
								<button
									type="button"
									className="min-w-0 flex-1 text-start"
									onClick={() => onView(project)}
								>
									<div className="flex flex-wrap items-center gap-2">
										<p className="font-medium text-text">
											{project.name ?? "—"}
										</p>
										<ProjectStatusBadge status={project.status} />
									</div>
									{project.description && (
										<p className="mt-1 line-clamp-2 text-xs text-muted">
											{project.description}
										</p>
									)}
									<div className="mt-2">
										<TeamsCell teams={project.teams} />
									</div>
								</button>
							</div>
							<div className="mt-3 border-t border-border/60 pt-3">
								<ActionButtons
									project={project}
									actionsDisabled={actionsDisabled}
									onEdit={onEdit}
									onImport={onImport}
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
				{t("projects.pagination.showing", {
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

export default ProjectsTable;

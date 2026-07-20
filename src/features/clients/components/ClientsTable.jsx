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
import { nestedEntityName } from "../../../utils/api/nestedRelations";
import ClientEmptyState from "./ClientEmptyState";
import ClientStatusSelect from "./ClientStatusSelect";

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

function AssignedCell({ assignee }) {
	if (!assignee) {
		return <span className="text-sm text-muted">—</span>;
	}
	const name = assignee.name ?? assignee.email ?? `#${assignee.id}`;
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

function SortIcon({ column }) {
	const sorted = column.getIsSorted();
	if (sorted === "asc")
		return <ArrowUp className="size-3.5" aria-hidden="true" />;
	if (sorted === "desc")
		return <ArrowDown className="size-3.5" aria-hidden="true" />;
	return <ArrowUpDown className="size-3.5 opacity-40" aria-hidden="true" />;
}

function ProjectBadge({ label }) {
	if (!label || label === "—") {
		return <span className="text-sm text-muted">—</span>;
	}
	return (
		<span className="inline-flex max-w-[10rem] truncate rounded-full bg-light-gold/70 px-2.5 py-0.5 text-xs font-medium text-gold ring-1 ring-inset ring-gold/20">
			{label}
		</span>
	);
}

function ActionButtons({
	client,
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
				onClick={() => onEdit(client)}
				className={`${btn} text-primary hover:bg-light-gold/60`}
			>
				<Pencil className="size-3.5" aria-hidden="true" />
				{t("clients.actions.edit")}
			</button>
			<button
				type="button"
				disabled={actionsDisabled}
				onClick={() => onDelete(client)}
				className={`${btn} text-red-600 hover:bg-red-50`}
			>
				<Trash2 className="size-3.5" aria-hidden="true" />
				{t("clients.actions.delete")}
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
					<div className="h-6 w-20 animate-pulse rounded-full bg-border/50" />
				</div>
			))}
		</div>
	</div>
);

const ClientsTable = ({
	clients,
	isLoading,
	isError,
	onRetry,
	isFilteredEmpty = false,
	sorting,
	onSortingChange,
	actionsDisabled = false,
	onView,
	onEdit,
	onDelete,
	onStatusChange,
	statusUpdatingId = null,
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
				id: "client",
				header: t("clients.columns.client"),
				cell: ({ row }) => {
					const client = row.original;
					return (
						<div className="flex min-w-0 items-center gap-3">
							<span
								className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarTone(client.name)}`}
							>
								{getInitials(client.name)}
							</span>
							<div className="min-w-0">
								<p className="truncate font-medium text-text">
									{client.name ?? "—"}
								</p>
								<p className="truncate text-xs text-muted">
									{client.email ?? "—"}
								</p>
							</div>
						</div>
					);
				},
			},
			{
				accessorKey: "phone",
				header: t("clients.columns.phone"),
				cell: ({ getValue }) => {
					const phone = getValue();
					if (!phone) return <span className="text-sm text-muted">—</span>;
					return (
						<a
							href={`tel:${phone}`}
							className="text-sm font-medium text-primary underline-offset-2 hover:underline"
							dir="ltr"
							onClick={(e) => e.stopPropagation()}
						>
							{phone}
						</a>
					);
				},
			},
			{
				id: "project",
				accessorFn: (row) => nestedEntityName(row.project),
				header: t("clients.columns.project"),
				cell: ({ getValue }) => <ProjectBadge label={getValue()} />,
			},
			{
				id: "assignedTo",
				accessorFn: (row) => nestedEntityName(row.assignee),
				header: t("clients.columns.assignedTo"),
				cell: ({ row }) => (
					<AssignedCell assignee={row.original.assignee} />
				),
			},
			{
				accessorKey: "status",
				header: t("clients.columns.status"),
				cell: ({ row }) => {
					const client = row.original;
					return (
						<div onClick={(e) => e.stopPropagation()}>
							<ClientStatusSelect
								status={client.status}
								onChange={(status) => onStatusChange?.(client, status)}
								disabled={actionsDisabled}
								isUpdating={
									statusUpdatingId != null &&
									String(statusUpdatingId) === String(client.id)
								}
							/>
						</div>
					);
				},
			},
			{
				accessorKey: "qualified_at",
				id: "qualified",
				header: t("clients.columns.qualified"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm text-muted">
						{formatDate(getValue())}
					</span>
				),
			},
			{
				accessorKey: "converted_at",
				id: "converted",
				header: t("clients.columns.converted"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm text-muted">
						{formatDate(getValue())}
					</span>
				),
			},
			{
				accessorKey: "created_at",
				id: "created",
				header: t("clients.columns.created"),
				cell: ({ getValue }) => (
					<span className="whitespace-nowrap text-sm text-muted">
						{formatDate(getValue())}
					</span>
				),
			},
			{
				id: "actions",
				enableSorting: false,
				header: t("clients.columns.actions"),
				cell: ({ row }) => (
					<ActionButtons
						client={row.original}
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
			onView,
			onEdit,
			onDelete,
			onStatusChange,
			statusUpdatingId,
		],
	);

	const table = useReactTable({
		data: clients ?? [],
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
				<ErrorState
					message={t("clients.errors.loadFailed")}
					onRetry={onRetry}
				/>
			</section>
		);
	}

	if (!clients?.length) {
		return <ClientEmptyState filtered={isFilteredEmpty} />;
	}

	return (
		<>
			{/* Mobile */}
			<div className="rounded-2xl border border-border bg-surface shadow-sm md:hidden">
				{visibleRows.map((row) => {
					const client = row.original;
					return (
						<article
							key={row.id}
							className="border-b border-border px-4 py-4 last:border-b-0"
						>
							<div className="flex items-start gap-3">
								<button
									type="button"
									className="flex min-w-0 flex-1 items-start gap-3 text-start"
									onClick={() => onView(client)}
								>
									<span
										className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarTone(client.name)}`}
									>
										{getInitials(client.name)}
									</span>
									<div className="min-w-0 flex-1">
										<p className="font-medium text-text">
											{client.name ?? "—"}
										</p>
										<p className="mt-1 text-xs text-muted" dir="ltr">
											{client.phone ?? "—"}
											{client.email ? ` · ${client.email}` : ""}
										</p>
										<div className="mt-2 flex flex-wrap gap-2">
											<ProjectBadge
												label={nestedEntityName(client.project)}
											/>
										</div>
									</div>
								</button>
								<ClientStatusSelect
									status={client.status}
									onChange={(status) =>
										onStatusChange?.(client, status)
									}
									disabled={actionsDisabled}
									isUpdating={
										statusUpdatingId != null &&
										String(statusUpdatingId) === String(client.id)
									}
								/>
							</div>
							<div className="mt-3 border-t border-border/60 pt-3">
								<ActionButtons
									client={client}
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

			<InfiniteScrollFooter
				shown={totalCount}
				total={totalFromServer}
				hasNextPage={hasNextPage}
				isFetchingNextPage={isFetchingNextPage}
				sentinelRef={sentinelRef}
				showingKey="clients.pagination.showing"
				loadingMoreKey="clients.pagination.loadingMore"
				endKey="clients.pagination.end"
			/>
		</>
	);
};

export default ClientsTable;

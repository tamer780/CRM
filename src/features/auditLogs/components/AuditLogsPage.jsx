import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuditLog } from "../../../hooks/auditLogs/useAuditLog";
import { useAuditLogs } from "../../../hooks/auditLogs/useAuditLogs";
import { useUsers } from "../../../hooks/users/useUsers";
import {
	collectUniqueActions,
	collectUniqueModels,
	computeAuditLogKpis,
} from "../utils/auditLogConstants";
import {
	applyFiltersToSearchParams,
	applySortingToParams,
	clearFilterParams,
	filterAuditLogs,
	filtersFromSearchParams,
	parseTableState,
	sortingFromParams,
} from "../utils/auditLogFilters";
import AuditLogDetailModal from "./AuditLogDetailModal";
import AuditLogsHeader from "./AuditLogsHeader";
import AuditLogsTable from "./AuditLogsTable";
import AuditLogsToolbar from "./AuditLogsToolbar";

function buildLookupMap(list) {
	const map = new Map();
	for (const item of list ?? []) {
		if (item?.id == null) continue;
		map.set(Number(item.id), item);
		map.set(String(item.id), item);
	}
	return map;
}

const AuditLogsPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	const logsQuery = useAuditLogs();
	const usersQuery = useUsers();

	const filters = useMemo(
		() => filtersFromSearchParams(searchParams),
		[searchParams],
	);
	const { sort, order, selected } = useMemo(
		() => parseTableState(searchParams),
		[searchParams],
	);

	const [searchInput, setSearchInput] = useState(filters.search);

	const detailQuery = useAuditLog(selected || null);

	useEffect(() => {
		setSearchInput(filters.search);
	}, [filters.search]);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchInput === filters.search) return;
			const next = applyFiltersToSearchParams(searchParams, {
				...filters,
				search: searchInput,
			});
			next.delete("page");
			setSearchParams(next, { replace: true });
		}, 300);
		return () => clearTimeout(timer);
	}, [searchInput, filters, searchParams, setSearchParams]);

	const sorting = useMemo(
		() => sortingFromParams(sort, order),
		[sort, order],
	);

	const usersMap = useMemo(
		() => buildLookupMap(usersQuery.data),
		[usersQuery.data],
	);

	const filteredLogs = useMemo(
		() => filterAuditLogs(logsQuery.data, filters),
		[logsQuery.data, filters],
	);

	const actionOptions = useMemo(
		() => collectUniqueActions(logsQuery.data),
		[logsQuery.data],
	);
	const modelOptions = useMemo(
		() => collectUniqueModels(logsQuery.data),
		[logsQuery.data],
	);

	const kpis = useMemo(
		() => computeAuditLogKpis(logsQuery.data),
		[logsQuery.data],
	);

	const isFilteredEmpty =
		!logsQuery.isLoading &&
		(logsQuery.data?.length ?? 0) > 0 &&
		filteredLogs.length === 0;

	const updateFilters = useCallback(
		(nextFilters) => {
			const next = applyFiltersToSearchParams(searchParams, nextFilters);
			next.delete("page");
			setSearchParams(next, { replace: true });
		},
		[searchParams, setSearchParams],
	);

	const resetFilters = useCallback(() => {
		setSearchInput("");
		setSearchParams(clearFilterParams(searchParams), { replace: true });
	}, [searchParams, setSearchParams]);

	const handleSortingChange = useCallback(
		(updater) => {
			const nextSorting =
				typeof updater === "function" ? updater(sorting) : updater;
			const next = applySortingToParams(searchParams, nextSorting);
			next.delete("page");
			setSearchParams(next, { replace: true });
		},
		[sorting, searchParams, setSearchParams],
	);

	const openDrawer = useCallback(
		(log) => {
			const next = new URLSearchParams(searchParams);
			next.set("selected", String(log.id));
			setSearchParams(next, { replace: true });
		},
		[searchParams, setSearchParams],
	);

	const closeDrawer = useCallback(() => {
		const next = new URLSearchParams(searchParams);
		next.delete("selected");
		setSearchParams(next, { replace: true });
	}, [searchParams, setSearchParams]);

	const detailLog =
		detailQuery.data ??
		filteredLogs.find((item) => String(item.id) === String(selected)) ??
		null;

	return (
		<div className="space-y-5">
			<AuditLogsHeader
				kpis={kpis}
				isLoading={logsQuery.isLoading}
				isRefreshing={logsQuery.isFetching}
				onRefresh={() => logsQuery.refetch()}
			/>

			{logsQuery.isLoading ? (
				<div className="h-24 animate-pulse rounded-2xl border border-border bg-surface shadow-sm" />
			) : (
				<AuditLogsToolbar
					filters={filters}
					searchInput={searchInput}
					onSearchInputChange={setSearchInput}
					onFiltersChange={updateFilters}
					onReset={resetFilters}
					actions={actionOptions}
					models={modelOptions}
					users={usersQuery.data ?? []}
				/>
			)}

			<div className="space-y-4">
				<AuditLogsTable
					logs={filteredLogs}
					isLoading={logsQuery.isLoading}
					isError={logsQuery.isError}
					onRetry={() => logsQuery.refetch()}
					isFilteredEmpty={isFilteredEmpty}
					usersMap={usersMap}
					sorting={sorting}
					onSortingChange={handleSortingChange}
					onView={openDrawer}
				/>
			</div>

			<AuditLogDetailModal
				open={Boolean(selected)}
				onClose={closeDrawer}
				log={detailLog}
				isLoading={Boolean(selected) && detailQuery.isLoading && !detailLog}
				isError={Boolean(selected) && detailQuery.isError && !detailLog}
				onRetry={() => detailQuery.refetch()}
				usersMap={usersMap}
			/>
		</div>
	);
};

export default AuditLogsPage;

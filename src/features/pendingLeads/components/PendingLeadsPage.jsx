import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useCampaigns } from "../../../hooks/campaigns/useCampaigns";
import { usePendingLead } from "../../../hooks/pendingLeads/usePendingLead";
import {
	useRemovePendingLead,
	useReplacePendingLead,
} from "../../../hooks/pendingLeads/usePendingLeadMutations";
import { usePendingLeads } from "../../../hooks/pendingLeads/usePendingLeads";
import { useProjects } from "../../../hooks/projects/useProjects";
import { useUsers } from "../../../hooks/users/useUsers";
import { extractApiError } from "../../../utils/api/apiHelpers";
import {
	mergeEntityLists,
	relationId,
} from "../../../utils/api/nestedRelations";
import {
	applyFiltersToSearchParams,
	applySortingToParams,
	clearFilterParams,
	filterPendingLeads,
	filtersFromSearchParams,
	parseTableState,
	sortingFromParams,
} from "../utils/pendingLeadFilters";
import PendingLeadDetailModal from "./PendingLeadDetailModal";
import PendingLeadRemoveModal from "./PendingLeadRemoveModal";
import PendingLeadReplaceModal from "./PendingLeadReplaceModal";
import PendingLeadsHeader from "./PendingLeadsHeader";
import PendingLeadsTable from "./PendingLeadsTable";
import PendingLeadsToolbar from "./PendingLeadsToolbar";

function buildLookupMap(list) {
	const map = new Map();
	for (const item of list ?? []) {
		if (item?.id == null) continue;
		map.set(Number(item.id), item);
		map.set(String(item.id), item);
	}
	return map;
}

const PendingLeadsPage = () => {
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();

	const pendingQuery = usePendingLeads();
	const projectsQuery = useProjects();
	const campaignsQuery = useCampaigns();
	const usersQuery = useUsers();

	const replaceMutation = useReplacePendingLead();
	const removeMutation = useRemovePendingLead();

	const filters = useMemo(
		() => filtersFromSearchParams(searchParams),
		[searchParams],
	);
	const { sort, order, selected } = useMemo(
		() => parseTableState(searchParams),
		[searchParams],
	);

	const [searchInput, setSearchInput] = useState(filters.search);
	const [replaceTarget, setReplaceTarget] = useState(null);
	const [removeTarget, setRemoveTarget] = useState(null);
	const [actionError, setActionError] = useState("");

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

	const toolbarProjects = useMemo(
		() => mergeEntityLists(projectsQuery.data, pendingQuery.data, "project"),
		[projectsQuery.data, pendingQuery.data],
	);
	const toolbarCampaigns = useMemo(
		() => mergeEntityLists(campaignsQuery.data, pendingQuery.data, "campaign"),
		[campaignsQuery.data, pendingQuery.data],
	);
	const usersMap = useMemo(
		() => buildLookupMap(usersQuery.data),
		[usersQuery.data],
	);
	const projectsMap = useMemo(
		() => buildLookupMap(toolbarProjects),
		[toolbarProjects],
	);
	const campaignsMap = useMemo(
		() => buildLookupMap(toolbarCampaigns),
		[toolbarCampaigns],
	);

	const filteredLeads = useMemo(
		() => filterPendingLeads(pendingQuery.data, filters),
		[pendingQuery.data, filters],
	);

	const isFilteredEmpty =
		!pendingQuery.isLoading &&
		(pendingQuery.data?.length ?? 0) > 0 &&
		filteredLeads.length === 0;

	const detailQuery = usePendingLead(selected || null);

	const actionsPending =
		replaceMutation.isPending ||
		removeMutation.isPending;

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
		const next = clearFilterParams(searchParams);
		setSearchParams(next, { replace: true });
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
		(lead) => {
			const next = new URLSearchParams(searchParams);
			next.set("selected", String(lead.id));
			setSearchParams(next, { replace: true });
		},
		[searchParams, setSearchParams],
	);

	const closeDrawer = useCallback(() => {
		const next = new URLSearchParams(searchParams);
		next.delete("selected");
		setSearchParams(next, { replace: true });
	}, [searchParams, setSearchParams]);

	const closeActionModals = () => {
		setReplaceTarget(null);
		setRemoveTarget(null);
		setActionError("");
	};

	const closeDrawerIfSelected = (id) => {
		if (selected && String(selected) === String(id)) {
			closeDrawer();
		}
	};

	const handleReplace = (note) => {
		if (!replaceTarget) return;
		const id = replaceTarget.id;
		replaceMutation.mutate(
			{ id, note },
			{
				onSuccess: () => {
					toast.success(t("pendingLeads.toasts.replaced"));
					closeActionModals();
					closeDrawerIfSelected(id);
				},
				onError: (error) => {
					setActionError(
						extractApiError(error, t("pendingLeads.errors.replaceFailed")),
					);
				},
			},
		);
	};

	const handleRemove = () => {
		if (!removeTarget) return;
		const id = removeTarget.id;
		removeMutation.mutate(id, {
			onSuccess: () => {
				toast.success(t("pendingLeads.toasts.removed"));
				closeActionModals();
				closeDrawerIfSelected(id);
			},
			onError: (error) => {
				setActionError(
					extractApiError(error, t("pendingLeads.errors.removeFailed")),
				);
			},
		});
	};

	const detailLead = detailQuery.data ?? null;

	return (
		<div className="space-y-5">
			<PendingLeadsHeader
				isRefreshing={pendingQuery.isFetching}
				onRefresh={() => pendingQuery.refetch()}
			/>

			{pendingQuery.isLoading ? (
				<div className="h-24 animate-pulse rounded-2xl border border-border bg-surface shadow-sm" />
			) : (
				<PendingLeadsToolbar
					filters={filters}
					searchInput={searchInput}
					onSearchInputChange={setSearchInput}
					onFiltersChange={updateFilters}
					onReset={resetFilters}
					projects={toolbarProjects}
					campaigns={toolbarCampaigns}
				/>
			)}

			<div className="space-y-4">
				<PendingLeadsTable
					leads={filteredLeads}
					isLoading={pendingQuery.isLoading}
					isError={pendingQuery.isError}
					onRetry={() => pendingQuery.refetch()}
					isFilteredEmpty={isFilteredEmpty}
					sorting={sorting}
					onSortingChange={handleSortingChange}
					actionsDisabled={actionsPending}
					onView={openDrawer}
					onReplace={(lead) => {
						setActionError("");
						setReplaceTarget(lead);
					}}
					onRemove={(lead) => {
						setActionError("");
						setRemoveTarget(lead);
					}}
				/>
			</div>

			<PendingLeadDetailModal
				open={Boolean(selected)}
				onClose={closeDrawer}
				lead={detailLead}
				isLoading={
					Boolean(selected) &&
					!detailQuery.data &&
					(detailQuery.isLoading || detailQuery.isFetching)
				}
				isError={Boolean(selected) && detailQuery.isError && !detailQuery.data}
				onRetry={() => detailQuery.refetch()}
				preventClose={actionsPending}
				usersMap={usersMap}
				projectsMap={projectsMap}
				campaignsMap={campaignsMap}
				actionsDisabled={actionsPending}
				onReplace={(lead) => {
					setActionError("");
					setReplaceTarget(lead);
				}}
				onRemove={(lead) => {
					setActionError("");
					setRemoveTarget(lead);
				}}
			/>

			<PendingLeadReplaceModal
				open={Boolean(replaceTarget)}
				lead={replaceTarget}
				isSubmitting={replaceMutation.isPending}
				error={actionError}
				onClose={() => !replaceMutation.isPending && closeActionModals()}
				onConfirm={handleReplace}
			/>

			<PendingLeadRemoveModal
				open={Boolean(removeTarget)}
				lead={removeTarget}
				isSubmitting={removeMutation.isPending}
				error={actionError}
				onClose={() => !removeMutation.isPending && closeActionModals()}
				onConfirm={handleRemove}
			/>
		</div>
	);
};

export default PendingLeadsPage;

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { usePermissions } from "../../../hooks/auth/usePermissions";
import { useCampaigns } from "../../../hooks/campaigns/useCampaigns";
import { useClient } from "../../../hooks/clients/useClient";
import { useClients } from "../../../hooks/clients/useClients";
import { useMarkClientLost } from "../../../hooks/clients/useMarkClientLost";
import { useProjects } from "../../../hooks/projects/useProjects";
import { useRestoreClient } from "../../../hooks/clients/useRestoreClient";
import { useUpdateClient } from "../../../hooks/clients/useUpdateClient";
import { useUsers } from "../../../hooks/users/useUsers";
import { extractApiError } from "../../../utils/api/apiHelpers";
import { clientMatchesScope } from "../../users/utils/permissions";
import {
	clientToFormValues,
	computeClientKpis,
	emptyClientFormValues,
	formValuesToPayload,
	validateClientForm,
} from "../utils/clientConstants";
import {
	applyFiltersToSearchParams,
	applySortingToParams,
	clearFilterParams,
	filterClients,
	filtersFromSearchParams,
	parseTableState,
	sortingFromParams,
} from "../utils/clientFilters";
import ClientDetailModal from "./ClientDetailModal";
import ClientFormModal from "./ClientFormModal";
import ClientMarkLostModal from "./ClientMarkLostModal";
import ClientRestoreModal from "./ClientRestoreModal";
import ClientsHeader from "./ClientsHeader";
import ClientsTable from "./ClientsTable";
import ClientsToolbar from "./ClientsToolbar";

function buildLookupMap(list) {
	const map = new Map();
	for (const item of list ?? []) {
		if (item?.id == null) continue;
		map.set(Number(item.id), item);
		map.set(String(item.id), item);
	}
	return map;
}

const ClientsPage = () => {
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();
	const { scope } = usePermissions();

	const clientsQuery = useClients();
	const projectsQuery = useProjects();
	const campaignsQuery = useCampaigns();
	const usersQuery = useUsers();
	const markLost = useMarkClientLost();
	const restore = useRestoreClient();

	const filters = useMemo(
		() => filtersFromSearchParams(searchParams),
		[searchParams],
	);
	const { sort, order, selected } = useMemo(
		() => parseTableState(searchParams),
		[searchParams],
	);

	const [searchInput, setSearchInput] = useState(filters.search);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [formValues, setFormValues] = useState(emptyClientFormValues());
	const [fieldErrors, setFieldErrors] = useState({});
	const [markLostTarget, setMarkLostTarget] = useState(null);
	const [markLostError, setMarkLostError] = useState("");
	const [restoreTarget, setRestoreTarget] = useState(null);
	const [restoreError, setRestoreError] = useState("");

	const updateClient = useUpdateClient(editingId);

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

	const projectsMap = useMemo(
		() => buildLookupMap(projectsQuery.data),
		[projectsQuery.data],
	);
	const campaignsMap = useMemo(
		() => buildLookupMap(campaignsQuery.data),
		[campaignsQuery.data],
	);
	const usersMap = useMemo(
		() => buildLookupMap(usersQuery.data),
		[usersQuery.data],
	);

	const scopedClients = useMemo(
		() =>
			(clientsQuery.data ?? []).filter((client) =>
				clientMatchesScope(client, scope),
			),
		[clientsQuery.data, scope],
	);

	const filteredClients = useMemo(
		() => filterClients(scopedClients, filters),
		[scopedClients, filters],
	);

	const kpis = useMemo(
		() => computeClientKpis(scopedClients),
		[scopedClients],
	);

	const isFilteredEmpty =
		!clientsQuery.isLoading &&
		scopedClients.length > 0 &&
		filteredClients.length === 0;

	const detailQuery = useClient(selected || null);

	const actionsPending =
		updateClient.isPending || markLost.isPending || restore.isPending;

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

	const openDetail = useCallback(
		(client) => {
			const next = new URLSearchParams(searchParams);
			next.set("selected", String(client.id));
			setSearchParams(next, { replace: true });
		},
		[searchParams, setSearchParams],
	);

	const closeDetail = useCallback(() => {
		const next = new URLSearchParams(searchParams);
		next.delete("selected");
		setSearchParams(next, { replace: true });
	}, [searchParams, setSearchParams]);

	const openEdit = (client) => {
		setEditingId(client.id);
		setFormValues(clientToFormValues(client));
		setFieldErrors({});
		setModalOpen(true);
	};

	const closeModal = () => {
		if (actionsPending) return;
		setModalOpen(false);
		setFieldErrors({});
		setEditingId(null);
	};

	const handleSubmit = (values) => {
		const errors = validateClientForm(values, t);
		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			return;
		}
		setFieldErrors({});
		const payload = formValuesToPayload(values);

		updateClient.mutate(payload, {
			onSuccess: () => {
				toast.success(t("clients.toasts.updated"));
				setModalOpen(false);
			},
			onError: (error) => {
				setFieldErrors({
					api: extractApiError(error, t("clients.errors.updateFailed")),
				});
			},
		});
	};

	const handleMarkLost = (reason) => {
		if (!markLostTarget) return;
		markLost.mutate(
			{ clientId: markLostTarget.id, reason },
			{
				onSuccess: () => {
					toast.success(t("clients.toasts.markedLost"));
					setMarkLostTarget(null);
					setMarkLostError("");
				},
				onError: (error) => {
					setMarkLostError(
						extractApiError(error, t("clients.errors.markLostFailed")),
					);
				},
			},
		);
	};

	const handleRestore = () => {
		if (!restoreTarget) return;
		restore.mutate(restoreTarget.id, {
			onSuccess: () => {
				toast.success(t("clients.toasts.restored"));
				setRestoreTarget(null);
				setRestoreError("");
			},
			onError: (error) => {
				setRestoreError(
					extractApiError(error, t("clients.errors.restoreFailed")),
				);
			},
		});
	};

	const detailClient =
		detailQuery.data ??
		filteredClients.find((item) => String(item.id) === String(selected)) ??
		null;

	return (
		<div className="space-y-5">
			<ClientsHeader
				kpis={kpis}
				isLoading={clientsQuery.isLoading}
				isRefreshing={clientsQuery.isFetching}
				onRefresh={() => clientsQuery.refetch()}
			/>

			{clientsQuery.isLoading ? (
				<div className="h-24 animate-pulse rounded-2xl border border-border bg-surface shadow-sm" />
			) : (
				<ClientsToolbar
					filters={filters}
					searchInput={searchInput}
					onSearchInputChange={setSearchInput}
					onFiltersChange={updateFilters}
					onReset={resetFilters}
					projects={projectsQuery.data ?? []}
					campaigns={campaignsQuery.data ?? []}
					users={usersQuery.data ?? []}
				/>
			)}

			<div className="space-y-4">
				<ClientsTable
					clients={filteredClients}
					isLoading={clientsQuery.isLoading}
					isError={clientsQuery.isError}
					onRetry={() => clientsQuery.refetch()}
					isFilteredEmpty={isFilteredEmpty}
					projectsMap={projectsMap}
					campaignsMap={campaignsMap}
					usersMap={usersMap}
					sorting={sorting}
					onSortingChange={handleSortingChange}
					actionsDisabled={actionsPending}
					onView={openDetail}
					onEdit={openEdit}
					onMarkLost={(client) => {
						setMarkLostError("");
						setMarkLostTarget(client);
					}}
					onRestore={(client) => {
						setRestoreError("");
						setRestoreTarget(client);
					}}
				/>
			</div>

			<ClientDetailModal
				open={Boolean(selected)}
				onClose={closeDetail}
				client={detailClient}
				isLoading={Boolean(selected) && detailQuery.isLoading && !detailClient}
				isError={Boolean(selected) && detailQuery.isError && !detailClient}
				onRetry={() => detailQuery.refetch()}
				preventClose={actionsPending}
				projectsMap={projectsMap}
				campaignsMap={campaignsMap}
				usersMap={usersMap}
			/>

			<ClientFormModal
				open={modalOpen}
				title={t("clients.editClient")}
				subtitle={t("clients.form.subtitle")}
				onClose={closeModal}
				preventClose={updateClient.isPending}
				values={formValues}
				onChange={(next) => {
					setFormValues(next);
					if (Object.keys(fieldErrors).length > 0) setFieldErrors({});
				}}
				onSubmit={handleSubmit}
				isSubmitting={updateClient.isPending}
				errors={fieldErrors}
				projects={projectsQuery.data ?? []}
				campaigns={campaignsQuery.data ?? []}
				users={usersQuery.data ?? []}
				projectsLoading={projectsQuery.isLoading}
				campaignsLoading={campaignsQuery.isLoading}
				usersLoading={usersQuery.isLoading}
			/>

			<ClientMarkLostModal
				open={Boolean(markLostTarget)}
				client={markLostTarget}
				isSubmitting={markLost.isPending}
				error={markLostError}
				onClose={() => !markLost.isPending && setMarkLostTarget(null)}
				onConfirm={handleMarkLost}
			/>

			<ClientRestoreModal
				open={Boolean(restoreTarget)}
				client={restoreTarget}
				isSubmitting={restore.isPending}
				error={restoreError}
				onClose={() => !restore.isPending && setRestoreTarget(null)}
				onConfirm={handleRestore}
			/>
		</div>
	);
};

export default ClientsPage;

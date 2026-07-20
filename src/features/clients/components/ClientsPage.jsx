import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { usePermissions } from "../../../hooks/auth/usePermissions";
import { useCampaigns } from "../../../hooks/campaigns/useCampaigns";
import { useClient } from "../../../hooks/clients/useClient";
import { useDeleteClient } from "../../../hooks/clients/useDeleteClient";
import { useInfiniteClients } from "../../../hooks/clients/useInfiniteClients";
import { useProjects } from "../../../hooks/projects/useProjects";
import { useUpdateClient } from "../../../hooks/clients/useUpdateClient";
import { useUpdateClientStatus } from "../../../hooks/clients/useUpdateClientStatus";
import { useUsers } from "../../../hooks/users/useUsers";
import { extractApiError } from "../../../utils/api/apiHelpers";
import {
	mergeEntityLists,
} from "../../../utils/api/nestedRelations";
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
import ClientDeleteDialog from "./ClientDeleteDialog";
import ClientDetailModal from "./ClientDetailModal";
import ClientFormModal from "./ClientFormModal";
import ClientsHeader from "./ClientsHeader";
import ClientsTable from "./ClientsTable";
import ClientsToolbar from "./ClientsToolbar";

const ClientsPage = () => {
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();
	const { scope } = usePermissions();

	const clientsQuery = useInfiniteClients();
	const projectsQuery = useProjects();
	const campaignsQuery = useCampaigns();
	const usersQuery = useUsers();
	const deleteClient = useDeleteClient();
	const updateClientStatus = useUpdateClientStatus();

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
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [deleteError, setDeleteError] = useState("");

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

	const toolbarProjects = useMemo(
		() => mergeEntityLists(projectsQuery.data, clientsQuery.data, "project"),
		[projectsQuery.data, clientsQuery.data],
	);
	const toolbarCampaigns = useMemo(
		() => mergeEntityLists(campaignsQuery.data, clientsQuery.data, "campaign"),
		[campaignsQuery.data, clientsQuery.data],
	);
	const toolbarUsers = useMemo(
		() => mergeEntityLists(usersQuery.data, clientsQuery.data, "assignee"),
		[usersQuery.data, clientsQuery.data],
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
		updateClient.isPending ||
		updateClientStatus.isPending ||
		deleteClient.isPending;

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
		if (selected) closeDetail();
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

	const handleStatusChange = (client, status) => {
		if (!client?.id || !status || status === client.status) return;
		updateClientStatus.mutate(
			{ client, status },
			{
				onSuccess: () => {
					toast.success(t("clients.toasts.updated"));
				},
				onError: (error) => {
					toast.error(
						extractApiError(error, t("clients.errors.updateFailed")),
					);
				},
			},
		);
	};

	const handleDelete = () => {
		if (!deleteTarget) return;
		const deletedId = deleteTarget.id;
		deleteClient.mutate(deletedId, {
			onSuccess: () => {
				toast.success(t("clients.toasts.deleted"));
				setDeleteTarget(null);
				setDeleteError("");
				if (selected && String(selected) === String(deletedId)) {
					closeDetail();
				}
			},
			onError: (error) => {
				setDeleteError(
					extractApiError(error, t("clients.errors.deleteFailed")),
				);
			},
		});
	};

	const detailClient = detailQuery.data ?? null;
	const detailPreview =
		!detailQuery.data && selected
			? filteredClients.find((item) => String(item.id) === String(selected)) ??
				null
			: null;

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
					projects={toolbarProjects}
					campaigns={toolbarCampaigns}
					users={toolbarUsers}
				/>
			)}

			<div className="space-y-4">
				<ClientsTable
					clients={filteredClients}
					isLoading={clientsQuery.isLoading}
					isError={clientsQuery.isError}
					onRetry={() => clientsQuery.refetch()}
					hasNextPage={clientsQuery.hasNextPage}
					isFetchingNextPage={clientsQuery.isFetchingNextPage}
					fetchNextPage={clientsQuery.fetchNextPage}
					serverTotal={clientsQuery.total}
					isFilteredEmpty={isFilteredEmpty}
					sorting={sorting}
					onSortingChange={handleSortingChange}
					actionsDisabled={actionsPending}
					onView={openDetail}
					onEdit={openEdit}
					onDelete={(client) => {
						setDeleteError("");
						setDeleteTarget(client);
					}}
					onStatusChange={handleStatusChange}
					statusUpdatingId={
						updateClientStatus.isPending
							? updateClientStatus.variables?.client?.id
							: null
					}
				/>
			</div>

			<ClientDetailModal
				open={Boolean(selected)}
				onClose={closeDetail}
				client={detailClient ?? detailPreview}
				isDetailReady={Boolean(detailClient)}
				isLoading={Boolean(selected) && detailQuery.isLoading && !detailClient}
				isError={Boolean(selected) && detailQuery.isError && !detailClient}
				onRetry={() => detailQuery.refetch()}
				preventClose={actionsPending}
				users={usersQuery.data ?? []}
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

			<ClientDeleteDialog
				open={Boolean(deleteTarget)}
				client={deleteTarget}
				isSubmitting={deleteClient.isPending}
				error={deleteError}
				onClose={() => !deleteClient.isPending && setDeleteTarget(null)}
				onConfirm={handleDelete}
			/>
		</div>
	);
};

export default ClientsPage;

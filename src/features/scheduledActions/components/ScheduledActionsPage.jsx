import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useClients } from "../../../hooks/clients/useClients";
import { useCompleteScheduledAction } from "../../../hooks/scheduledActions/useCompleteScheduledAction";
import { useCreateScheduledAction } from "../../../hooks/scheduledActions/useCreateScheduledAction";
import { useDeleteScheduledAction } from "../../../hooks/scheduledActions/useDeleteScheduledAction";
import { useLeads } from "../../../hooks/leads/useLeads";
import { useScheduledAction } from "../../../hooks/scheduledActions/useScheduledAction";
import { useScheduledActions } from "../../../hooks/scheduledActions/useScheduledActions";
import { useUpdateScheduledAction } from "../../../hooks/scheduledActions/useUpdateScheduledAction";
import { useUsers } from "../../../hooks/users/useUsers";
import { extractApiError } from "../../../utils/api/apiHelpers";
import {
	computeScheduledActionKpis,
	emptyScheduledActionFormValues,
	formValuesToPayload,
	scheduledActionToFormValues,
	validateScheduledActionForm,
} from "../utils/scheduledActionConstants";
import {
	applyFiltersToSearchParams,
	applySortingToParams,
	clearFilterParams,
	filterScheduledActions,
	filtersFromSearchParams,
	parseTableState,
	sortingFromParams,
} from "../utils/scheduledActionFilters";
import ScheduledActionCompleteModal from "./ScheduledActionCompleteModal";
import ScheduledActionDeleteDialog from "./ScheduledActionDeleteDialog";
import ScheduledActionDetailModal from "./ScheduledActionDetailModal";
import ScheduledActionFormModal from "./ScheduledActionFormModal";
import ScheduledActionsHeader from "./ScheduledActionsHeader";
import ScheduledActionsTable from "./ScheduledActionsTable";
import ScheduledActionsToolbar from "./ScheduledActionsToolbar";

function buildLookupMap(list) {
	const map = new Map();
	for (const item of list ?? []) {
		if (item?.id == null) continue;
		map.set(Number(item.id), item);
		map.set(String(item.id), item);
	}
	return map;
}

const ScheduledActionsPage = () => {
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();

	const actionsQuery = useScheduledActions();
	const usersQuery = useUsers();
	const leadsQuery = useLeads();
	const clientsQuery = useClients();
	const createAction = useCreateScheduledAction();
	const deleteAction = useDeleteScheduledAction();
	const completeAction = useCompleteScheduledAction();

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
	const [modalMode, setModalMode] = useState("create");
	const [editingId, setEditingId] = useState(null);
	const [formValues, setFormValues] = useState(
		emptyScheduledActionFormValues(),
	);
	const [fieldErrors, setFieldErrors] = useState({});
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [deleteError, setDeleteError] = useState("");
	const [completeTarget, setCompleteTarget] = useState(null);
	const [completeError, setCompleteError] = useState("");

	const updateAction = useUpdateScheduledAction(editingId);
	const detailQuery = useScheduledAction(selected || null);

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

	useEffect(() => {
		if (searchParams.get("create") === "1") {
			setModalMode("create");
			setEditingId(null);
			setFormValues(emptyScheduledActionFormValues());
			setFieldErrors({});
			setModalOpen(true);
			const next = new URLSearchParams(searchParams);
			next.delete("create");
			setSearchParams(next, { replace: true });
		}
	}, [searchParams, setSearchParams]);

	const sorting = useMemo(
		() => sortingFromParams(sort, order),
		[sort, order],
	);

	const usersMap = useMemo(
		() => buildLookupMap(usersQuery.data),
		[usersQuery.data],
	);
	const leadsMap = useMemo(
		() => buildLookupMap(leadsQuery.data),
		[leadsQuery.data],
	);
	const clientsMap = useMemo(
		() => buildLookupMap(clientsQuery.data),
		[clientsQuery.data],
	);

	const filteredActions = useMemo(
		() => filterScheduledActions(actionsQuery.data, filters),
		[actionsQuery.data, filters],
	);

	const kpis = useMemo(
		() => computeScheduledActionKpis(actionsQuery.data),
		[actionsQuery.data],
	);

	const isFilteredEmpty =
		!actionsQuery.isLoading &&
		(actionsQuery.data?.length ?? 0) > 0 &&
		filteredActions.length === 0;

	const actionsPending =
		createAction.isPending ||
		updateAction.isPending ||
		deleteAction.isPending ||
		completeAction.isPending;

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
		(action) => {
			const next = new URLSearchParams(searchParams);
			next.set("selected", String(action.id));
			setSearchParams(next, { replace: true });
		},
		[searchParams, setSearchParams],
	);

	const closeDetail = useCallback(() => {
		const next = new URLSearchParams(searchParams);
		next.delete("selected");
		setSearchParams(next, { replace: true });
	}, [searchParams, setSearchParams]);

	const openCreate = () => {
		setModalMode("create");
		setEditingId(null);
		setFormValues(emptyScheduledActionFormValues());
		setFieldErrors({});
		setModalOpen(true);
	};

	const openEdit = (action) => {
		setModalMode("edit");
		setEditingId(action.id);
		setFormValues(scheduledActionToFormValues(action));
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
		const errors = validateScheduledActionForm(values, t);
		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			return;
		}
		setFieldErrors({});
		const payload = formValuesToPayload(values);

		if (modalMode === "create") {
			createAction.mutate(payload, {
				onSuccess: () => {
					toast.success(t("scheduledActions.toasts.created"));
					setModalOpen(false);
				},
				onError: (error) => {
					setFieldErrors({
						api: extractApiError(
							error,
							t("scheduledActions.errors.createFailed"),
						),
					});
				},
			});
			return;
		}

		updateAction.mutate(payload, {
			onSuccess: () => {
				toast.success(t("scheduledActions.toasts.updated"));
				setModalOpen(false);
			},
			onError: (error) => {
				setFieldErrors({
					api: extractApiError(
						error,
						t("scheduledActions.errors.updateFailed"),
					),
				});
			},
		});
	};

	const handleComplete = (body) => {
		if (!completeTarget) return;
		completeAction.mutate(
			{ scheduledActionId: completeTarget.id, body },
			{
				onSuccess: () => {
					toast.success(t("scheduledActions.toasts.completed"));
					setCompleteTarget(null);
					setCompleteError("");
				},
				onError: (error) => {
					setCompleteError(
						extractApiError(
							error,
							t("scheduledActions.errors.completeFailed"),
						),
					);
				},
			},
		);
	};

	const handleDelete = () => {
		if (!deleteTarget) return;
		const id = deleteTarget.id;
		deleteAction.mutate(id, {
			onSuccess: () => {
				toast.success(t("scheduledActions.toasts.deleted"));
				setDeleteTarget(null);
				setDeleteError("");
				if (selected && String(selected) === String(id)) {
					closeDetail();
				}
			},
			onError: (error) => {
				setDeleteError(
					extractApiError(error, t("scheduledActions.errors.deleteFailed")),
				);
			},
		});
	};

	const detailAction =
		detailQuery.data ??
		filteredActions.find((item) => String(item.id) === String(selected)) ??
		null;

	const isSubmitting =
		modalMode === "create" ? createAction.isPending : updateAction.isPending;

	return (
		<div className="space-y-5">
			<ScheduledActionsHeader
				kpis={kpis}
				isLoading={actionsQuery.isLoading}
				isRefreshing={actionsQuery.isFetching}
				onRefresh={() => actionsQuery.refetch()}
				onCreate={openCreate}
			/>

			{actionsQuery.isLoading ? (
				<div className="h-24 animate-pulse rounded-2xl border border-border bg-surface shadow-sm" />
			) : (
				<ScheduledActionsToolbar
					filters={filters}
					searchInput={searchInput}
					onSearchInputChange={setSearchInput}
					onFiltersChange={updateFilters}
					onReset={resetFilters}
					users={usersQuery.data ?? []}
				/>
			)}

			<div className="space-y-4">
				<ScheduledActionsTable
					actions={filteredActions}
					isLoading={actionsQuery.isLoading}
					isError={actionsQuery.isError}
					onRetry={() => actionsQuery.refetch()}
					isFilteredEmpty={isFilteredEmpty}
					usersMap={usersMap}
					leadsMap={leadsMap}
					clientsMap={clientsMap}
					sorting={sorting}
					onSortingChange={handleSortingChange}
					actionsDisabled={actionsPending}
					onView={openDetail}
					onEdit={openEdit}
					onComplete={(action) => {
						setCompleteError("");
						setCompleteTarget(action);
					}}
					onDelete={(action) => {
						setDeleteError("");
						setDeleteTarget(action);
					}}
					onCreate={openCreate}
				/>
			</div>

			<ScheduledActionDetailModal
				open={Boolean(selected)}
				onClose={closeDetail}
				action={detailAction}
				isLoading={
					Boolean(selected) && detailQuery.isLoading && !detailAction
				}
				isError={Boolean(selected) && detailQuery.isError && !detailAction}
				onRetry={() => detailQuery.refetch()}
				preventClose={actionsPending}
				usersMap={usersMap}
				leadsMap={leadsMap}
				clientsMap={clientsMap}
				actionsDisabled={actionsPending}
				onEdit={openEdit}
				onComplete={(action) => {
					setCompleteError("");
					setCompleteTarget(action);
				}}
				onDelete={(action) => {
					setDeleteError("");
					setDeleteTarget(action);
				}}
			/>

			<ScheduledActionFormModal
				open={modalOpen}
				mode={modalMode}
				title={
					modalMode === "edit"
						? t("scheduledActions.editAction")
						: t("scheduledActions.newAction")
				}
				subtitle={t("scheduledActions.form.subtitle")}
				onClose={closeModal}
				preventClose={isSubmitting}
				values={formValues}
				onChange={(next) => {
					setFormValues(next);
					if (Object.keys(fieldErrors).length > 0) setFieldErrors({});
				}}
				onSubmit={handleSubmit}
				isSubmitting={isSubmitting}
				errors={fieldErrors}
				users={usersQuery.data ?? []}
				usersLoading={usersQuery.isLoading}
				leads={leadsQuery.data ?? []}
				leadsLoading={leadsQuery.isLoading}
				clients={clientsQuery.data ?? []}
				clientsLoading={clientsQuery.isLoading}
			/>

			<ScheduledActionCompleteModal
				open={Boolean(completeTarget)}
				action={completeTarget}
				isSubmitting={completeAction.isPending}
				apiError={completeError}
				onClose={() =>
					!completeAction.isPending && setCompleteTarget(null)
				}
				onConfirm={handleComplete}
			/>

			<ScheduledActionDeleteDialog
				open={Boolean(deleteTarget)}
				action={deleteTarget}
				isSubmitting={deleteAction.isPending}
				error={deleteError}
				onClose={() => !deleteAction.isPending && setDeleteTarget(null)}
				onConfirm={handleDelete}
			/>
		</div>
	);
};

export default ScheduledActionsPage;

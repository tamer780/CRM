import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useCampaign } from "../../../hooks/campaigns/useCampaign";
import { useCampaigns } from "../../../hooks/campaigns/useCampaigns";
import { useCreateCampaign } from "../../../hooks/campaigns/useCreateCampaign";
import { useDeleteCampaign } from "../../../hooks/campaigns/useDeleteCampaign";
import { useProjects } from "../../../hooks/projects/useProjects";
import { useUpdateCampaign } from "../../../hooks/campaigns/useUpdateCampaign";
import { extractApiError } from "../../../utils/api/apiHelpers";
import {
	campaignToFormValues,
	computeCampaignKpis,
	emptyCampaignFormValues,
	formValuesToPayload,
	validateCampaignForm,
} from "../utils/campaignConstants";
import {
	applyFiltersToSearchParams,
	applySortingToParams,
	clearFilterParams,
	filterCampaigns,
	filtersFromSearchParams,
	parseTableState,
	sortingFromParams,
} from "../utils/campaignFilters";
import CampaignDeleteDialog from "./CampaignDeleteDialog";
import CampaignDetailModal from "./CampaignDetailModal";
import CampaignFormModal from "./CampaignFormModal";
import CampaignsHeader from "./CampaignsHeader";
import CampaignsTable from "./CampaignsTable";
import CampaignsToolbar from "./CampaignsToolbar";

function buildLookupMap(list) {
	const map = new Map();
	for (const item of list ?? []) {
		if (item?.id == null) continue;
		map.set(Number(item.id), item);
		map.set(String(item.id), item);
	}
	return map;
}

const CampaignsPage = () => {
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();

	const campaignsQuery = useCampaigns();
	const projectsQuery = useProjects();
	const createCampaign = useCreateCampaign();
	const deleteCampaign = useDeleteCampaign();

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
	const [formValues, setFormValues] = useState(emptyCampaignFormValues());
	const [fieldErrors, setFieldErrors] = useState({});
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [deleteError, setDeleteError] = useState("");

	const updateCampaign = useUpdateCampaign(editingId);

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
			setFormValues(emptyCampaignFormValues());
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

	const projectsMap = useMemo(
		() => buildLookupMap(projectsQuery.data),
		[projectsQuery.data],
	);

	const filteredCampaigns = useMemo(
		() => filterCampaigns(campaignsQuery.data, filters),
		[campaignsQuery.data, filters],
	);

	const kpis = useMemo(
		() => computeCampaignKpis(campaignsQuery.data),
		[campaignsQuery.data],
	);

	const isFilteredEmpty =
		!campaignsQuery.isLoading &&
		(campaignsQuery.data?.length ?? 0) > 0 &&
		filteredCampaigns.length === 0;

	const detailQuery = useCampaign(selected || null);

	const actionsPending =
		createCampaign.isPending ||
		updateCampaign.isPending ||
		deleteCampaign.isPending;

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
		(campaign) => {
			const next = new URLSearchParams(searchParams);
			next.set("selected", String(campaign.id));
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
		setFormValues(emptyCampaignFormValues());
		setFieldErrors({});
		setModalOpen(true);
	};

	const openEdit = (campaign) => {
		if (selected) closeDetail();
		setModalMode("edit");
		setEditingId(campaign.id);
		setFormValues(campaignToFormValues(campaign));
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
		const errors = validateCampaignForm(values, t);
		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			return;
		}
		setFieldErrors({});
		const payload = formValuesToPayload(values);

		if (modalMode === "create") {
			createCampaign.mutate(payload, {
				onSuccess: () => {
					toast.success(t("campaigns.toasts.created"));
					setModalOpen(false);
				},
				onError: (error) => {
					setFieldErrors({
						api: extractApiError(error, t("campaigns.errors.createFailed")),
					});
				},
			});
			return;
		}

		updateCampaign.mutate(payload, {
			onSuccess: () => {
				toast.success(t("campaigns.toasts.updated"));
				setModalOpen(false);
			},
			onError: (error) => {
				setFieldErrors({
					api: extractApiError(error, t("campaigns.errors.updateFailed")),
				});
			},
		});
	};

	const handleDelete = () => {
		if (!deleteTarget) return;
		const id = deleteTarget.id;
		deleteCampaign.mutate(id, {
			onSuccess: () => {
				toast.success(t("campaigns.toasts.deleted"));
				setDeleteTarget(null);
				setDeleteError("");
				if (selected && String(selected) === String(id)) {
					closeDetail();
				}
			},
			onError: (error) => {
				setDeleteError(
					extractApiError(error, t("campaigns.errors.deleteFailed")),
				);
			},
		});
	};

	const detailCampaign =
		detailQuery.data ??
		filteredCampaigns.find((item) => String(item.id) === String(selected)) ??
		null;

	const isSubmitting =
		modalMode === "create"
			? createCampaign.isPending
			: updateCampaign.isPending;

	return (
		<div className="space-y-5">
			<CampaignsHeader
				kpis={kpis}
				isLoading={campaignsQuery.isLoading}
				isRefreshing={campaignsQuery.isFetching}
				onRefresh={() => campaignsQuery.refetch()}
				onCreate={openCreate}
			/>

			{campaignsQuery.isLoading ? (
				<div className="h-24 animate-pulse rounded-2xl border border-border bg-surface shadow-sm" />
			) : (
				<CampaignsToolbar
					filters={filters}
					searchInput={searchInput}
					onSearchInputChange={setSearchInput}
					onFiltersChange={updateFilters}
					onReset={resetFilters}
					projects={projectsQuery.data ?? []}
				/>
			)}

			<div className="space-y-4">
				<CampaignsTable
					campaigns={filteredCampaigns}
					isLoading={campaignsQuery.isLoading}
					isError={campaignsQuery.isError}
					onRetry={() => campaignsQuery.refetch()}
					isFilteredEmpty={isFilteredEmpty}
					projectsMap={projectsMap}
					sorting={sorting}
					onSortingChange={handleSortingChange}
					actionsDisabled={actionsPending}
					onView={openDetail}
					onEdit={openEdit}
					onDelete={(campaign) => {
						setDeleteError("");
						setDeleteTarget(campaign);
					}}
					onCreate={openCreate}
				/>
			</div>

			<CampaignDetailModal
				open={Boolean(selected)}
				onClose={closeDetail}
				campaign={detailCampaign}
				isLoading={Boolean(selected) && detailQuery.isLoading && !detailCampaign}
				isError={Boolean(selected) && detailQuery.isError && !detailCampaign}
				onRetry={() => detailQuery.refetch()}
				preventClose={actionsPending}
				projectsMap={projectsMap}
			/>

			<CampaignFormModal
				open={modalOpen}
				mode={modalMode}
				title={
					modalMode === "edit"
						? t("campaigns.editCampaign")
						: t("campaigns.newCampaign")
				}
				subtitle={t("campaigns.form.subtitle")}
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
				projects={projectsQuery.data ?? []}
				projectsLoading={projectsQuery.isLoading}
			/>

			<CampaignDeleteDialog
				open={Boolean(deleteTarget)}
				campaign={deleteTarget}
				isSubmitting={deleteCampaign.isPending}
				error={deleteError}
				onClose={() => !deleteCampaign.isPending && setDeleteTarget(null)}
				onConfirm={handleDelete}
			/>
		</div>
	);
};

export default CampaignsPage;

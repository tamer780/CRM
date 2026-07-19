import { FileUp, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAssignLead } from "../../../hooks/leads/useAssignLead";
import { useBulkAssignLeads } from "../../../hooks/leads/useBulkAssignLeads";
import { useBulkDeleteLeads } from "../../../hooks/leads/useBulkDeleteLeads";
import { useBulkUpdateLeadStatus } from "../../../hooks/leads/useBulkUpdateLeadStatus";
import { useCampaigns } from "../../../hooks/campaigns/useCampaigns";
import { useCreateLead } from "../../../hooks/leads/useCreateLead";
import { useDeleteLead } from "../../../hooks/leads/useDeleteLead";
import { useImportLeads } from "../../../hooks/leads/useImportLeads";
import { useLeads } from "../../../hooks/leads/useLeads";
import { useProjects } from "../../../hooks/projects/useProjects";
import { useUpdateLead } from "../../../hooks/leads/useUpdateLead";
import { useUpdateLeadStatus } from "../../../hooks/leads/useUpdateLeadStatus";
import { useUsers } from "../../../hooks/users/useUsers";
import { usePermissions } from "../../../hooks/auth/usePermissions";
import { PERMISSIONS } from "../../users/utils/permissions";
import { extractApiError } from "../../../utils/api/apiHelpers";
import {
	emptyLeadFormValues,
	formValuesToPayload,
	leadToFormValues,
	validateLeadForm,
} from "../../../utils/leads/leadConstants";
import { buildLookupMap } from "../../../utils/leads/resolveLeadLabels";
import LeadBulkAssignBar from "./LeadBulkAssignBar";
import LeadDeleteDialog from "./LeadDeleteDialog";
import LeadDetailDrawer from "./LeadDetailDrawer";
import LeadForm from "./LeadForm";
import LeadFormModal from "./LeadFormModal";
import LeadImportModal from "./LeadImportModal";
import LeadMarkLostModal from "./LeadMarkLostModal";
import LeadTable from "./LeadTable";
import LeadToolbar from "./LeadToolbar";

const emptyFilters = () => ({
	search: "",
	status: ["default"],
	source: "",
	projectId: "",
	campaignId: "",
	assignedTo: [],
	assignedAtFrom: "",
	assignedAtTo: "",
	createdFrom: "",
	createdTo: "",
	lastActionFrom: "",
	lastActionTo: "",
});

const LeadPage = () => {
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();
	const { can } = usePermissions();
	const canEditLeads = can(PERMISSIONS.LEADS_EDIT);
	const canDeleteLeads = can(PERMISSIONS.LEADS_DELETE);
	const canImportLeads = can(PERMISSIONS.LEADS_IMPORT);

	const [filters, setFilters] = useState(emptyFilters);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState("create");
	const [editingLeadId, setEditingLeadId] = useState(null);
	const [formValues, setFormValues] = useState(emptyLeadFormValues());
	const [fieldErrors, setFieldErrors] = useState({});
	const [deleteLeadTarget, setDeleteLeadTarget] = useState(null);
	const [deleteError, setDeleteError] = useState("");
	const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
	const [bulkDeleteError, setBulkDeleteError] = useState("");
	const [lostLeadTarget, setLostLeadTarget] = useState(null);
	const [lostError, setLostError] = useState("");
	const [selectedIds, setSelectedIds] = useState(() => new Set());
	const [importOpen, setImportOpen] = useState(false);
	const [importError, setImportError] = useState("");

	const leadsQuery = useLeads({
		status: filters.status,
		assignedTo: filters.assignedTo,
		assignedAtFrom: filters.assignedAtFrom,
		assignedAtTo: filters.assignedAtTo,
		createdFrom: filters.createdFrom,
		createdTo: filters.createdTo,
		lastActionFrom: filters.lastActionFrom,
		lastActionTo: filters.lastActionTo,
	});
	const projectsQuery = useProjects();
	const campaignsQuery = useCampaigns();
	const usersQuery = useUsers();
	const createLead = useCreateLead();
	const deleteLead = useDeleteLead();
	const assignLead = useAssignLead();
	const bulkAssignLeads = useBulkAssignLeads();
	const bulkDeleteLeads = useBulkDeleteLeads();
	const bulkUpdateLeadStatus = useBulkUpdateLeadStatus();
	const updateLeadStatus = useUpdateLeadStatus();
	const importLeads = useImportLeads();

	const selectedLeadId = searchParams.get("selected");
	const updateLead = useUpdateLead(editingLeadId);

	const openDetail = useCallback(
		(lead) => {
			const next = new URLSearchParams(searchParams);
			next.set("selected", String(lead.id));
			setSearchParams(next, { replace: true });
		},
		[searchParams, setSearchParams],
	);

	const closeDetail = useCallback(() => {
		const next = new URLSearchParams(searchParams);
		next.delete("selected");
		setSearchParams(next, { replace: true });
	}, [searchParams, setSearchParams]);

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

	const filteredLeads = useMemo(() => {
		const list = leadsQuery.data ?? [];
		const q = filters.search.trim().toLowerCase();

		return list.filter((lead) => {
			if (filters.source && lead.source !== filters.source) return false;
			if (
				filters.projectId &&
				String(lead.project_id) !== String(filters.projectId)
			) {
				return false;
			}
			if (
				filters.campaignId &&
				String(lead.campaign_id) !== String(filters.campaignId)
			) {
				return false;
			}
			if (!q) return true;
			const haystack = [lead.name, lead.phone, lead.email]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();
			return haystack.includes(q);
		});
	}, [leadsQuery.data, filters]);

	const isFilteredEmpty =
		(leadsQuery.data?.length ?? 0) > 0 && filteredLeads.length === 0;

	useEffect(() => {
		const visible = new Set(filteredLeads.map((lead) => String(lead.id)));
		setSelectedIds((prev) => {
			let changed = false;
			const next = new Set();
			for (const id of prev) {
				if (visible.has(id)) next.add(id);
				else changed = true;
			}
			return changed || next.size !== prev.size ? next : prev;
		});
	}, [filteredLeads]);

	const isFormSubmitting =
		modalMode === "create" ? createLead.isPending : updateLead.isPending;

	const openCreate = () => {
		setModalMode("create");
		setEditingLeadId(null);
		setFormValues(emptyLeadFormValues());
		setFieldErrors({});
		setModalOpen(true);
	};

	useEffect(() => {
		if (searchParams.get("create") === "1") {
			setModalMode("create");
			setEditingLeadId(null);
			setFormValues(emptyLeadFormValues());
			setFieldErrors({});
			setModalOpen(true);
			const next = new URLSearchParams(searchParams);
			next.delete("create");
			setSearchParams(next, { replace: true });
		}
	}, [searchParams, setSearchParams]);

	const openEdit = (lead) => {
		if (!canEditLeads) return;
		setModalMode("edit");
		setEditingLeadId(lead.id);
		setFormValues(leadToFormValues(lead));
		setFieldErrors({});
		setModalOpen(true);
	};

	const closeModal = () => {
		if (isFormSubmitting) return;
		setModalOpen(false);
		setFieldErrors({});
		setEditingLeadId(null);
	};

	const handleFormSubmit = (values) => {
		const errors = validateLeadForm(values, t);
		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			return;
		}
		setFieldErrors({});

		if (modalMode === "create") {
			const payload = formValuesToPayload(values, { mode: "create" });
			createLead.mutate(payload, {
				onError: (error) => {
					setFieldErrors({
						api: extractApiError(error, t("leads.errors.createFailed")),
					});
				},
				onSuccess: () => {
					setModalOpen(false);
				},
			});
			return;
		}

		const payload = formValuesToPayload(values, { mode: "update" });
		updateLead.mutate(payload, {
			onError: (error) => {
				setFieldErrors({
					api: extractApiError(error, t("leads.errors.updateFailed")),
				});
			},
			onSuccess: () => {
				setModalOpen(false);
				setEditingLeadId(null);
			},
		});
	};

	const handleAssignChange = (lead, user_id) => {
		if (!lead?.id || user_id == null) return;
		if (String(lead.assigned_to) === String(user_id)) return;
		const isReassign = Boolean(lead.assigned_to);
		assignLead.mutate({
			leadId: lead.id,
			user_id,
			reason: "",
			isReassign,
		});
	};

	const toggleSelect = (leadId) => {
		const key = String(leadId);
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
	};

	const toggleSelectAll = () => {
		setSelectedIds((prev) => {
			const allVisible = filteredLeads.map((lead) => String(lead.id));
			const allSelected =
				allVisible.length > 0 && allVisible.every((id) => prev.has(id));
			if (allSelected) return new Set();
			return new Set(allVisible);
		});
	};

	const clearSelection = () => setSelectedIds(new Set());

	const handleBulkAssign = async (user_id) => {
		if (user_id == null || selectedIds.size === 0) return;
		const lead_ids = filteredLeads
			.filter((lead) => selectedIds.has(String(lead.id)))
			.map((lead) => Number(lead.id));
		if (!lead_ids.length) return;

		await bulkAssignLeads.mutateAsync({ user_id, lead_ids });
		clearSelection();
	};

	const handleBulkStatus = async (status) => {
		if (!status || selectedIds.size === 0) return;
		const lead_ids = filteredLeads
			.filter((lead) => selectedIds.has(String(lead.id)))
			.map((lead) => Number(lead.id));
		if (!lead_ids.length) return;

		await bulkUpdateLeadStatus.mutateAsync({ status, lead_ids });
		clearSelection();
	};

	const openBulkDelete = () => {
		if (!canDeleteLeads || selectedIds.size === 0) return;
		setBulkDeleteError("");
		setBulkDeleteOpen(true);
	};

	const handleBulkDelete = () => {
		if (selectedIds.size === 0) return;
		const lead_ids = filteredLeads
			.filter((lead) => selectedIds.has(String(lead.id)))
			.map((lead) => Number(lead.id));
		if (!lead_ids.length) return;

		setBulkDeleteError("");
		bulkDeleteLeads.mutate(
			{ lead_ids },
			{
				onError: (error) => {
					setBulkDeleteError(
						extractApiError(error, t("leads.errors.updateFailed")),
					);
				},
				onSuccess: () => {
					setBulkDeleteOpen(false);
					clearSelection();
				},
			},
		);
	};

	const handleStatusChange = (lead, status) => {
		if (!lead?.id || !status) return;
		if (status === "lost") {
			setLostError("");
			setLostLeadTarget(lead);
			return;
		}
		updateLeadStatus.mutate({ leadId: lead.id, status });
	};

	const handleMarkLost = (lost_reason) => {
		if (!lostLeadTarget) return;
		setLostError("");
		updateLeadStatus.mutate(
			{
				leadId: lostLeadTarget.id,
				status: "lost",
				lost_reason,
			},
			{
				onError: (error) => {
					setLostError(
						extractApiError(error, t("leads.errors.updateFailed")),
					);
				},
				onSuccess: () => {
					setLostLeadTarget(null);
				},
			},
		);
	};

	const handleDelete = () => {
		if (!deleteLeadTarget) return;
		setDeleteError("");
		deleteLead.mutate(deleteLeadTarget.id, {
			onError: (error) => {
				setDeleteError(
					extractApiError(error, t("leads.errors.updateFailed")),
				);
			},
			onSuccess: () => {
				setDeleteLeadTarget(null);
			},
		});
	};

	const handleImport = ({ file, source }) => {
		if (!canImportLeads) return;
		setImportError("");
		importLeads.mutate(
			{ file, source },
			{
				onSuccess: () => {
					toast.success(t("leads.toasts.imported"));
					setImportOpen(false);
					setImportError("");
				},
				onError: (error) => {
					setImportError(
						extractApiError(error, t("leads.errors.importFailed")),
					);
				},
			},
		);
	};

	return (
		<div className="space-y-5">
			{/* Page header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
						{t("leads.title")}
					</h1>
					<p className="mt-1.5 text-muted">{t("leads.subtitle")}</p>
					<p className="mt-2 text-sm text-muted">
						{t("leads.count", { count: filteredLeads.length })}
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={() => leadsQuery.refetch()}
						disabled={leadsQuery.isFetching}
						className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm font-medium text-text shadow-sm transition hover:bg-background disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
					>
						<RefreshCw
							className={`size-4 text-muted ${leadsQuery.isFetching ? "animate-spin" : ""}`}
							aria-hidden="true"
						/>
						{t("dashboard.refresh")}
					</button>
					{canImportLeads && (
						<button
							type="button"
							onClick={() => {
								setImportError("");
								setImportOpen(true);
							}}
							className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm font-medium text-text shadow-sm transition hover:bg-background disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
						>
							<FileUp className="size-4 text-muted" aria-hidden="true" />
							{t("leads.actions.import")}
						</button>
					)}
					<button
						type="button"
						onClick={openCreate}
						className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-primary shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
					>
						<Plus className="size-4" aria-hidden="true" />
						{t("leads.addLead")}
					</button>
				</div>
			</div>

			<LeadToolbar
				filters={filters}
				onFiltersChange={setFilters}
				projects={projectsQuery.data ?? []}
				campaigns={campaignsQuery.data ?? []}
				users={usersQuery.data ?? []}
			/>

			<LeadBulkAssignBar
				selectedCount={selectedIds.size}
				users={usersQuery.data ?? []}
				isAssigning={bulkAssignLeads.isPending}
				isUpdatingStatus={bulkUpdateLeadStatus.isPending}
				isDeleting={bulkDeleteLeads.isPending}
				onAssign={handleBulkAssign}
				onStatusChange={handleBulkStatus}
				onDelete={openBulkDelete}
				onClear={clearSelection}
				canDelete={canDeleteLeads}
			/>

			<LeadTable
				leads={filteredLeads}
				isLoading={leadsQuery.isLoading}
				isError={leadsQuery.isError}
				onRetry={() => leadsQuery.refetch()}
				onAddLead={openCreate}
				isFilteredEmpty={isFilteredEmpty}
				projectsMap={projectsMap}
				campaignsMap={campaignsMap}
				users={usersQuery.data ?? []}
				onView={openDetail}
				onEdit={openEdit}
				onDelete={(lead) => {
					if (!canDeleteLeads) return;
					setDeleteError("");
					setDeleteLeadTarget(lead);
				}}
				onStatusChange={handleStatusChange}
				onAssignChange={handleAssignChange}
				statusUpdatingId={
					updateLeadStatus.isPending
						? updateLeadStatus.variables?.leadId
						: null
				}
				assignUpdatingId={
					assignLead.isPending ? assignLead.variables?.leadId : null
				}
				selectedIds={selectedIds}
				onToggleSelect={toggleSelect}
				onToggleSelectAll={toggleSelectAll}
				canEdit={canEditLeads}
				canDelete={canDeleteLeads}
			/>

			<LeadDetailDrawer
				open={Boolean(selectedLeadId)}
				onClose={closeDetail}
				leadId={selectedLeadId}
				projectsMap={projectsMap}
				campaignsMap={campaignsMap}
				usersMap={usersMap}
				projects={projectsQuery.data ?? []}
				campaigns={campaignsQuery.data ?? []}
				users={usersQuery.data ?? []}
				projectsLoading={projectsQuery.isLoading}
				campaignsLoading={campaignsQuery.isLoading}
				usersLoading={usersQuery.isLoading}
				canEdit={canEditLeads}
			/>

			<LeadFormModal
				open={modalOpen}
				title={
					modalMode === "create" ? t("leads.addLead") : t("leads.editLead")
				}
				subtitle={t("leads.subtitle")}
				onClose={closeModal}
				preventClose={isFormSubmitting}
			>
				<LeadForm
					mode={modalMode}
					values={formValues}
					onChange={(next) => {
						setFormValues(next);
						if (Object.keys(fieldErrors).length > 0) {
							setFieldErrors({});
						}
					}}
					onSubmit={handleFormSubmit}
					onCancel={closeModal}
					isSubmitting={isFormSubmitting}
					errors={fieldErrors}
					projects={projectsQuery.data ?? []}
					campaigns={campaignsQuery.data ?? []}
					users={usersQuery.data ?? []}
					projectsLoading={projectsQuery.isLoading}
					campaignsLoading={campaignsQuery.isLoading}
					usersLoading={usersQuery.isLoading}
				/>
			</LeadFormModal>

			<LeadDeleteDialog
				open={Boolean(deleteLeadTarget)}
				lead={deleteLeadTarget}
				isSubmitting={deleteLead.isPending}
				error={deleteError}
				onClose={() => {
					if (!deleteLead.isPending) setDeleteLeadTarget(null);
				}}
				onConfirm={handleDelete}
			/>

			<LeadDeleteDialog
				open={bulkDeleteOpen}
				count={selectedIds.size}
				isSubmitting={bulkDeleteLeads.isPending}
				error={bulkDeleteError}
				onClose={() => {
					if (!bulkDeleteLeads.isPending) setBulkDeleteOpen(false);
				}}
				onConfirm={handleBulkDelete}
			/>

			<LeadMarkLostModal
				open={Boolean(lostLeadTarget)}
				lead={lostLeadTarget}
				isSubmitting={updateLeadStatus.isPending}
				error={lostError}
				onClose={() => {
					if (!updateLeadStatus.isPending) setLostLeadTarget(null);
				}}
				onConfirm={handleMarkLost}
			/>

			{canImportLeads && (
				<LeadImportModal
					open={importOpen}
					isSubmitting={importLeads.isPending}
					error={importError}
					onClose={() => !importLeads.isPending && setImportOpen(false)}
					onConfirm={handleImport}
				/>
			)}
		</div>
	);
};

export default LeadPage;

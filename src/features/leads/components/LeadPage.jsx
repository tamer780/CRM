import { Download, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useAssignLead } from "../../../hooks/leads/useAssignLead";
import { useBulkAssignLeads } from "../../../hooks/leads/useBulkAssignLeads";
import { useBulkDeleteLeads } from "../../../hooks/leads/useBulkDeleteLeads";
import { useBulkUpdateLeadStatus } from "../../../hooks/leads/useBulkUpdateLeadStatus";
import { useCampaigns } from "../../../hooks/campaigns/useCampaigns";
import { useCreateLead } from "../../../hooks/leads/useCreateLead";
import { useDeleteLead } from "../../../hooks/leads/useDeleteLead";
import { useLeads } from "../../../hooks/leads/useLeads";
import { useProjects } from "../../../hooks/projects/useProjects";
import { useUpdateLead } from "../../../hooks/leads/useUpdateLead";
import { useUpdateLeadStatus } from "../../../hooks/leads/useUpdateLeadStatus";
import { useUsers } from "../../../hooks/users/useUsers";
import { extractApiError } from "../../../utils/api/apiHelpers";
import {
	emptyLeadFormValues,
	formValuesToPayload,
	leadToFormValues,
	validateLeadForm,
} from "../../../utils/leads/leadConstants";
import { exportLeadsCsv } from "../utils/exportLeadsCsv";
import LeadBulkAssignBar from "./LeadBulkAssignBar";
import LeadDeleteDialog from "./LeadDeleteDialog";
import LeadDetailDrawer from "./LeadDetailDrawer";
import LeadForm from "./LeadForm";
import LeadFormModal from "./LeadFormModal";
import LeadMarkLostModal from "./LeadMarkLostModal";
import LeadTable from "./LeadTable";
import LeadToolbar from "./LeadToolbar";

const emptyFilters = () => ({
	search: "",
	status: ["default"],
	source: "",
	projectId: "",
	campaignId: "",
	assignedTo: "",
	dateFrom: "",
	dateTo: "",
});

function buildLookupMap(list) {
	const map = new Map();
	for (const item of list ?? []) {
		if (item?.id == null) continue;
		map.set(Number(item.id), item);
		map.set(String(item.id), item);
	}
	return map;
}

function inDateRange(createdAt, dateFrom, dateTo) {
	if (!dateFrom && !dateTo) return true;
	if (!createdAt) return false;
	const ts = new Date(createdAt).getTime();
	if (Number.isNaN(ts)) return false;
	if (dateFrom) {
		const start = new Date(`${dateFrom}T00:00:00`).getTime();
		if (ts < start) return false;
	}
	if (dateTo) {
		const end = new Date(`${dateTo}T23:59:59.999`).getTime();
		if (ts > end) return false;
	}
	return true;
}

const LeadPage = () => {
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();

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

	const leadsQuery = useLeads({ status: filters.status });
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
			if (
				filters.assignedTo &&
				String(lead.assigned_to) !== String(filters.assignedTo)
			) {
				return false;
			}
			if (!inDateRange(lead.created_at, filters.dateFrom, filters.dateTo)) {
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
		if (selectedIds.size === 0) return;
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

	const handleExport = () => {
		exportLeadsCsv(filteredLeads, {
			projectsMap,
			campaignsMap,
			usersMap,
		});
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
					<button
						type="button"
						onClick={handleExport}
						disabled={!filteredLeads.length}
						className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm font-medium text-text shadow-sm transition hover:bg-background disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
					>
						<Download className="size-4 text-muted" aria-hidden="true" />
						Export
					</button>
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
		</div>
	);
};

export default LeadPage;

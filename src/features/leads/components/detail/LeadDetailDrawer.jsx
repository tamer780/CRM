import { MessageCircle, Pencil, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ErrorState from "../../../../components/dashboard/ErrorState";
import LoadingSkeleton from "../../../../components/dashboard/LoadingSkeleton";
import SideDrawer from "../../../../components/ui/SideDrawer";
import { useLead } from "../../../../hooks/leads/useLead";
import { useUpdateLead } from "../../../../hooks/leads/useUpdateLead";
import { extractApiError } from "../../../../utils/api/apiHelpers";
import {
	formValuesToPayload,
	leadToFormValues,
	validateLeadForm,
} from "../../../../utils/leads/leadConstants";
import LeadForm from "../form/LeadForm";
import LeadFormModal from "../form/LeadFormModal";
import LeadAssignSelect from "../table/LeadAssignSelect";
import LeadStatusSelect from "../table/LeadStatusSelect";
import LeadActivityPanel from "./LeadActivityPanel";
import LeadDetailCard from "./LeadDetailCard";

const actionButtonClassName =
	"inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text shadow-sm transition hover:bg-background";

const LeadDetailDrawer = ({
	open,
	onClose,
	leadId,
	usersMap,
	projects = [],
	campaigns = [],
	users = [],
	projectsLoading = false,
	campaignsLoading = false,
	usersLoading = false,
	canEdit = true,
	canChangeStatus = canEdit,
	canAssign = canEdit,
	canDelete = false,
	onDelete,
	onStatusChange,
	onAssignChange,
	statusUpdatingId = null,
	assignUpdatingId = null,
}) => {
	const { t } = useTranslation();
	const leadQuery = useLead(open ? leadId : null);
	const updateLead = useUpdateLead(leadId);

	const [modalOpen, setModalOpen] = useState(false);
	const [formValues, setFormValues] = useState(leadToFormValues());
	const [fieldErrors, setFieldErrors] = useState({});

	useEffect(() => {
		if (leadQuery.data) {
			setFormValues(leadToFormValues(leadQuery.data));
		}
	}, [leadQuery.data]);

	useEffect(() => {
		if (!open) {
			setModalOpen(false);
			setFieldErrors({});
		}
	}, [open]);

	const openEdit = () => {
		setFormValues(leadToFormValues(leadQuery.data));
		setFieldErrors({});
		setModalOpen(true);
	};

	const closeModal = () => {
		if (updateLead.isPending) return;
		setModalOpen(false);
		setFieldErrors({});
	};

	const handleUpdate = (values) => {
		const errors = validateLeadForm(values, t);
		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			return;
		}
		setFieldErrors({});

		const payload = formValuesToPayload(values, { mode: "update" });
		updateLead.mutate(payload, {
			onError: (error) => {
				setFieldErrors({
					api: extractApiError(error, t("leads.errors.updateFailed")),
				});
			},
			onSuccess: () => {
				setModalOpen(false);
			},
		});
	};

	const lead = leadQuery.data;
	const waPhone = lead?.phone ? String(lead.phone).replace(/\D/g, "") : "";

	const title = lead ? (
		<span className="flex min-w-0 items-center gap-2">
			<span className="truncate">{lead.name}</span>
			<span className="shrink-0 text-sm font-normal text-muted">
				#{lead.id}
			</span>
		</span>
	) : (
		t("leads.title")
	);

	const subtitle = lead ? (
		<div className="mt-1.5 flex flex-wrap items-center gap-2">
			<LeadStatusSelect
				status={lead.status}
				onChange={(status) => onStatusChange?.(lead, status)}
				isUpdating={statusUpdatingId === lead.id}
				disabled={!canChangeStatus}
				placement="bottom"
			/>
			<LeadAssignSelect
				assignedTo={lead.assigned_to}
				assignee={lead.assignee}
				users={users}
				onChange={(userId) => onAssignChange?.(lead, userId)}
				isUpdating={assignUpdatingId === lead.id}
				disabled={!canAssign}
				placement="bottom"
			/>
		</div>
	) : null;

	return (
		<>
			<SideDrawer
				open={open}
				onClose={onClose}
				title={title}
				subtitle={subtitle}
				size="xl"
				preventClose={updateLead.isPending && modalOpen}
				headerActions={
					lead ? (
						<div className="flex flex-wrap items-center gap-2">
							{lead.phone && (
								<>
									<a
										href={`tel:${lead.phone}`}
										className={actionButtonClassName}
										aria-label={t("leads.detail.call")}
									>
										<Phone className="size-4 text-muted" aria-hidden="true" />
										{t("leads.detail.call")}
									</a>
									{waPhone && (
										<a
											href={`https://wa.me/${waPhone}`}
											target="_blank"
											rel="noopener noreferrer"
											className={actionButtonClassName}
											aria-label={t("leads.detail.whatsapp")}
										>
											<MessageCircle
												className="size-4 text-muted"
												aria-hidden="true"
											/>
											{t("leads.detail.whatsapp")}
										</a>
									)}
								</>
							)}
							{canEdit && (
								<button
									type="button"
									onClick={openEdit}
									className={actionButtonClassName}
								>
									<Pencil className="size-4 text-muted" aria-hidden="true" />
									{t("leads.editLead")}
								</button>
							)}
						</div>
					) : null
				}
			>
				{leadQuery.isLoading && (
					<div className="space-y-4">
						<LoadingSkeleton variant="header" />
						<LoadingSkeleton variant="table" />
					</div>
				)}

				{(leadQuery.isError || (!leadQuery.isLoading && !lead)) && (
					<ErrorState
						message={t("leads.errors.loadFailed")}
						onRetry={() => leadQuery.refetch()}
					/>
				)}

				{lead && (
					<div className="space-y-6">
						<LeadDetailCard lead={lead} usersMap={usersMap}>
							<LeadActivityPanel
								leadId={leadId}
								leadStatus={lead.status}
								users={users}
							/>
						</LeadDetailCard>
					</div>
				)}
			</SideDrawer>

			<LeadFormModal
				open={modalOpen}
				title={t("leads.editLead")}
				subtitle={t("leads.subtitle")}
				onClose={closeModal}
				preventClose={updateLead.isPending}
			>
				<LeadForm
					mode="edit"
					values={formValues}
					onChange={(next) => {
						setFormValues(next);
						if (Object.keys(fieldErrors).length > 0) {
							setFieldErrors({});
						}
					}}
					onSubmit={handleUpdate}
					onCancel={closeModal}
					onDelete={
						canDelete && lead
							? () => {
									if (updateLead.isPending) return;
									setModalOpen(false);
									setFieldErrors({});
									onDelete?.(lead);
								}
							: undefined
					}
					canDelete={canDelete}
					isSubmitting={updateLead.isPending}
					errors={fieldErrors}
					projects={projects}
					campaigns={campaigns}
					users={users}
					projectsLoading={projectsLoading}
					campaignsLoading={campaignsLoading}
					usersLoading={usersLoading}
				/>
			</LeadFormModal>
		</>
	);
};

export default LeadDetailDrawer;

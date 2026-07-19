import { MessageCircle, Pencil, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ErrorState from "../../../components/dashboard/ErrorState";
import LoadingSkeleton from "../../../components/dashboard/LoadingSkeleton";
import StatusBadge from "../../../components/dashboard/StatusBadge";
import LeadDetailCard from "../../../components/leads/LeadDetailCard";
import SideDrawer from "../../../components/ui/SideDrawer";
import SourceBadge from "../../../components/ui/SourceBadge";
import { useLead } from "../../../hooks/leads/useLead";
import { useUpdateLead } from "../../../hooks/leads/useUpdateLead";
import { extractApiError } from "../../../utils/api/apiHelpers";
import {
	formValuesToPayload,
	leadToFormValues,
	validateLeadForm,
} from "../../../utils/leads/leadConstants";
import { resolveUserLabel } from "../../../utils/leads/resolveLeadLabels";
import LeadActivityPanel from "./LeadActivityPanel";
import LeadForm from "./LeadForm";
import LeadFormModal from "./LeadFormModal";

const actionButtonClassName =
	"inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text shadow-sm transition hover:bg-background";

const LeadDetailDrawer = ({
	open,
	onClose,
	leadId,
	projectsMap,
	campaignsMap,
	usersMap,
	projects = [],
	campaigns = [],
	users = [],
	projectsLoading = false,
	campaignsLoading = false,
	usersLoading = false,
	canEdit = true,
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
	const assigneeLabel =
		lead?.assigned_to != null && lead.assigned_to !== ""
			? resolveUserLabel(usersMap, lead.assigned_to)
			: null;
	const waPhone = lead?.phone ? String(lead.phone).replace(/\D/g, "") : "";

	const title = lead ? (
		<span className="flex flex-wrap items-center gap-2">
			<span className="truncate">{lead.name}</span>
			<StatusBadge status={lead.status} />
		</span>
	) : (
		t("leads.title")
	);

	const subtitle = lead ? (
		<div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
			{lead.phone && (
				<span className="inline-flex items-center gap-1.5" dir="ltr">
					<Phone className="size-3.5 shrink-0" aria-hidden="true" />
					{lead.phone}
				</span>
			)}
			{lead.source && (
				<span className="inline-flex items-center">
					<SourceBadge source={lead.source} />
				</span>
			)}
			{assigneeLabel && assigneeLabel !== "—" && (
				<span className="inline-flex items-center gap-1.5">
					<User className="size-3.5 shrink-0" aria-hidden="true" />
					{assigneeLabel}
				</span>
			)}
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
						<LeadDetailCard
							lead={lead}
							projectsMap={projectsMap}
							campaignsMap={campaignsMap}
							usersMap={usersMap}
						/>
						<LeadActivityPanel
							leadId={leadId}
							lead={lead}
							users={users}
						/>
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

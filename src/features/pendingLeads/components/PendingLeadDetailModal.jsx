import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import DuplicateStatusBadge from "../../../components/ui/DuplicateStatusBadge";
import SourceBadge from "../../../components/ui/SourceBadge";
import { getDuplicateType } from "../utils/pendingLeadConstants";

function formatDateTime(value) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function Field({ label, value, dir }) {
	return (
		<div>
			<p className="text-xs font-medium uppercase tracking-wide text-muted">
				{label}
			</p>
			<p className="mt-1 text-sm text-text" dir={dir}>
				{value == null || value === "" ? "—" : value}
			</p>
		</div>
	);
}

function PendingLeadDetailSkeleton() {
	return (
		<div className="space-y-6 px-5 py-5 sm:px-6">
			{Array.from({ length: 4 }).map((_, section) => (
				<div key={section} className="space-y-3">
					<div className="h-4 w-32 animate-pulse rounded bg-border/70" />
					<div className="grid grid-cols-2 gap-3">
						{Array.from({ length: 4 }).map((_, i) => (
							<div key={i} className="space-y-2">
								<div className="h-3 w-16 animate-pulse rounded bg-border/50" />
								<div className="h-4 w-full animate-pulse rounded bg-border/70" />
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

function resolveUserLabel(usersMap, id) {
	if (id == null || id === "") return "—";
	const user = usersMap?.get(Number(id)) ?? usersMap?.get(String(id));
	if (!user) return String(id);
	return user.name ?? user.email ?? String(id);
}

function resolveEntityLabel(map, id) {
	if (id == null || id === "") return "—";
	const item = map?.get(Number(id)) ?? map?.get(String(id));
	if (!item) return String(id);
	return item.name ?? item.title ?? String(id);
}

const PendingLeadDetailModal = ({
	open,
	onClose,
	lead,
	isLoading,
	isError,
	onRetry,
	preventClose = false,
	projectsMap,
	campaignsMap,
	usersMap,
}) => {
	const { t } = useTranslation();
	const titleId = useId();
	const descId = useId();
	const dialogRef = useRef(null);
	const previousFocusRef = useRef(null);
	const duplicateType = lead ? getDuplicateType(lead) : null;
	const title = lead?.name ?? t("pendingLeads.drawer.title");
	const subtitle = lead?.email ?? undefined;

	useEffect(() => {
		if (!open) return undefined;

		previousFocusRef.current = document.activeElement;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const dialog = dialogRef.current;
		const focusable = dialog?.querySelector(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
		);
		focusable?.focus();

		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				if (!preventClose) {
					event.preventDefault();
					onClose();
				}
				return;
			}

			if (event.key !== "Tab" || !dialog) return;

			const nodes = dialog.querySelectorAll(
				'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
			);
			const list = Array.from(nodes);
			if (list.length === 0) return;

			const first = list[0];
			const last = list[list.length - 1];

			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = previousOverflow;
			previousFocusRef.current?.focus?.();
		};
	}, [open, onClose, preventClose]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
			<div
				className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
				onClick={() => {
					if (!preventClose) onClose();
				}}
				aria-hidden="true"
			/>
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				aria-describedby={subtitle ? descId : undefined}
				className="animate-card-in relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden border border-border bg-surface shadow-xl max-sm:h-full max-sm:max-h-none max-sm:rounded-none sm:rounded-2xl"
			>
				<div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
					<div className="min-w-0">
						<h2
							id={titleId}
							className="text-lg font-semibold text-text sm:text-xl"
						>
							{title}
						</h2>
						{subtitle && (
							<p id={descId} className="mt-1 truncate text-sm text-muted">
								{subtitle}
							</p>
						)}
					</div>
					<button
						type="button"
						onClick={onClose}
						disabled={preventClose}
						className="rounded-lg p-2 text-muted transition hover:bg-background hover:text-text disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
						aria-label={t("common.close")}
					>
						<X className="size-5" />
					</button>
				</div>

				<div className="min-h-0 flex-1 overflow-y-auto">
					{isLoading && <PendingLeadDetailSkeleton />}

					{isError && !isLoading && (
						<div className="px-5 py-8 sm:px-6">
							<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
								<p className="text-sm text-red-600">
									{t("pendingLeads.errors.loadDetailFailed")}
								</p>
								{onRetry && (
									<button
										type="button"
										onClick={onRetry}
										className="mt-3 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white"
									>
										{t("dashboard.retry")}
									</button>
								)}
							</div>
						</div>
					)}

					{lead && !isLoading && (
						<div className="space-y-6 px-5 py-5 sm:px-6">
							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("pendingLeads.drawer.leadInfo")}
								</h3>
								<div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:grid-cols-2 lg:grid-cols-3">
									<Field label={t("leads.form.name")} value={lead.name} />
									<Field
										label={t("leads.form.phone")}
										value={lead.phone}
										dir="ltr"
									/>
									<Field label={t("leads.form.email")} value={lead.email} />
									<div>
										<p className="text-xs font-medium uppercase tracking-wide text-muted">
											{t("leads.form.source")}
										</p>
										<div className="mt-1.5">
											<SourceBadge source={lead.source} />
										</div>
									</div>
									<Field
										label={t("leads.form.project")}
										value={resolveEntityLabel(projectsMap, lead.project_id)}
									/>
									<Field
										label={t("leads.form.campaign")}
										value={resolveEntityLabel(campaignsMap, lead.campaign_id)}
									/>
									<Field
										label={t("leads.detail.createdBy")}
										value={resolveUserLabel(usersMap, lead.created_by)}
									/>
									<Field
										label={t("pendingLeads.drawer.createdAt")}
										value={formatDateTime(lead.created_at)}
									/>
									<Field
										label={t("leads.detail.updatedAt")}
										value={formatDateTime(lead.updated_at)}
									/>
								</div>
							</section>

							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("pendingLeads.drawer.duplicateInfo")}
								</h3>
								<div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										<Field
											label={t("pendingLeads.columns.duplicateType")}
											value={
												duplicateType
													? t(`pendingLeads.duplicateType.${duplicateType}`)
													: "—"
											}
										/>
										<div>
											<p className="text-xs font-medium uppercase tracking-wide text-muted">
												{t("pendingLeads.columns.status")}
											</p>
											<div className="mt-1.5">
												<DuplicateStatusBadge status={lead.duplicate_status} />
											</div>
										</div>
										<div className="sm:col-span-2">
											<Field
												label={t("pendingLeads.columns.duplicateReason")}
												value={lead.duplicate_reason}
											/>
										</div>
										<Field
											label={t("pendingLeads.drawer.existingLeadId")}
											value={lead.existing_lead_id}
										/>
										<Field
											label={t("pendingLeads.drawer.existingClientId")}
											value={lead.existing_client_id}
										/>
										<Field
											label={t("pendingLeads.drawer.reviewedBy")}
											value={resolveUserLabel(usersMap, lead.reviewed_by)}
										/>
										<Field
											label={t("pendingLeads.drawer.reviewedAt")}
											value={formatDateTime(lead.reviewed_at)}
										/>
										<div className="sm:col-span-2">
											<Field
												label={t("pendingLeads.drawer.resolutionNote")}
												value={lead.resolution_note}
											/>
										</div>
									</div>
								</div>
							</section>

							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("pendingLeads.drawer.assignment")}
								</h3>
								<div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:grid-cols-2">
									<Field
										label={t("leads.columns.assignedTo")}
										value={resolveUserLabel(usersMap, lead.assigned_to)}
									/>
									<Field
										label={t("leads.form.scheduledCall")}
										value={formatDateTime(lead.scheduled_call_at)}
									/>
								</div>
							</section>

							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("pendingLeads.drawer.notes")}
								</h3>
								<textarea
									readOnly
									value={lead.note ?? ""}
									rows={4}
									className="w-full resize-none rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm text-text outline-none"
									placeholder={t("pendingLeads.drawer.noNotes")}
								/>
							</section>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default PendingLeadDetailModal;

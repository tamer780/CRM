import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useBodyScrollLock } from "../../../hooks/ui/useBodyScrollLock";
import DuplicateStatusBadge from "../../../components/ui/DuplicateStatusBadge";
import { nestedEntityName } from "../../../utils/api/nestedRelations";
import { getDuplicateType } from "../utils/pendingLeadConstants";
import PendingLeadComparePanel from "./PendingLeadComparePanel";
import PendingLeadHistoryTabs from "./PendingLeadHistoryTabs";

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

function PendingLeadDetailSkeleton() {
	return (
		<div className="space-y-6 px-5 py-5 sm:px-6">
			<div className="h-16 animate-pulse rounded-2xl bg-border/50" />
			<div className="h-64 animate-pulse rounded-2xl bg-border/40" />
			<div className="h-48 animate-pulse rounded-2xl bg-border/40" />
		</div>
	);
}

const PendingLeadDetailModal = ({
	open,
	onClose,
	lead,
	isLoading,
	isError,
	onRetry,
	preventClose = false,
	usersMap,
	projectsMap,
	campaignsMap,
	onReplace,
	onRemove,
	actionsDisabled = false,
}) => {
	const { t } = useTranslation();
	const titleId = useId();
	const descId = useId();
	const dialogRef = useRef(null);
	const previousFocusRef = useRef(null);
	const duplicateType = lead ? getDuplicateType(lead) : null;
	const title = lead?.name ?? t("pendingLeads.drawer.title");
	const subtitle = lead?.email || lead?.phone || undefined;
	const isPending = lead?.duplicate_status === "pending";
	const showActions =
		isPending && (onReplace || onRemove) && !isLoading && !isError;

	useBodyScrollLock(open);

	useEffect(() => {
		if (!open) return undefined;

		previousFocusRef.current = document.activeElement;

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
				className="animate-card-in relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden border border-border bg-surface shadow-xl max-sm:h-full max-sm:max-h-none max-sm:rounded-none sm:rounded-2xl"
			>
				<div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<h2
								id={titleId}
								className="text-lg font-semibold text-text sm:text-xl"
							>
								{title}
							</h2>
							{lead?.duplicate_status && (
								<DuplicateStatusBadge status={lead.duplicate_status} />
							)}
							{duplicateType && (
								<span className="inline-flex rounded-full bg-background px-2.5 py-0.5 text-xs font-medium text-muted ring-1 ring-inset ring-border">
									{t(`pendingLeads.duplicateType.${duplicateType}`)}
								</span>
							)}
						</div>
						{subtitle && (
							<p id={descId} className="mt-1 truncate text-sm text-muted" dir="ltr">
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
							<section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-wide text-amber-800/80">
									{t("pendingLeads.columns.duplicateReason")}
								</p>
								<p className="mt-1.5 text-sm leading-relaxed text-amber-950">
									{lead.duplicate_reason ||
										t("pendingLeads.drawer.noDuplicateReason")}
								</p>
								{lead.duplicate_status !== "pending" && (
									<div className="mt-3 grid grid-cols-1 gap-3 border-t border-amber-200/80 pt-3 sm:grid-cols-3">
										<div>
											<p className="text-[11px] font-medium uppercase tracking-wide text-amber-800/70">
												{t("pendingLeads.drawer.reviewedBy")}
											</p>
											<p className="mt-1 text-sm text-amber-950">
												{nestedEntityName(lead.reviewed_by_user) !== "—"
													? nestedEntityName(lead.reviewed_by_user)
													: lead.reviewed_by ?? "—"}
											</p>
										</div>
										<div>
											<p className="text-[11px] font-medium uppercase tracking-wide text-amber-800/70">
												{t("pendingLeads.drawer.reviewedAt")}
											</p>
											<p className="mt-1 text-sm text-amber-950">
												{formatDateTime(lead.reviewed_at)}
											</p>
										</div>
										<div className="sm:col-span-1">
											<p className="text-[11px] font-medium uppercase tracking-wide text-amber-800/70">
												{t("pendingLeads.drawer.resolutionNote")}
											</p>
											<p className="mt-1 text-sm text-amber-950">
												{lead.resolution_note || "—"}
											</p>
										</div>
									</div>
								)}
							</section>

							<PendingLeadComparePanel
								lead={lead}
								projectsMap={projectsMap}
								campaignsMap={campaignsMap}
								usersMap={usersMap}
							/>

							<PendingLeadHistoryTabs
								existingLead={lead.existing_lead}
								usersMap={usersMap}
							/>
						</div>
					)}
				</div>

				{showActions && (
					<div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border bg-surface px-5 py-4 sm:px-6">
						<button
							type="button"
							onClick={onClose}
							disabled={preventClose || actionsDisabled}
							className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition hover:bg-background disabled:opacity-60"
						>
							{t("common.close")}
						</button>
						{onRemove && (
							<button
								type="button"
								onClick={() => onRemove(lead)}
								disabled={actionsDisabled}
								className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
							>
								{t("pendingLeads.actions.remove")}
							</button>
						)}
						{onReplace && (
							<button
								type="button"
								onClick={() => onReplace(lead)}
								disabled={actionsDisabled}
								className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
							>
								{t("pendingLeads.actions.replace")}
							</button>
						)}
					</div>
				)}

				{!showActions && lead && !isLoading && !isError && (
					<div className="flex shrink-0 justify-end border-t border-border px-5 py-4 sm:px-6">
						<button
							type="button"
							onClick={onClose}
							disabled={preventClose}
							className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition hover:bg-background disabled:opacity-60"
						>
							{t("common.close")}
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default PendingLeadDetailModal;

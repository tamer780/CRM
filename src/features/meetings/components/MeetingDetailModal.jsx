import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useBodyScrollLock } from "../../../hooks/ui/useBodyScrollLock";
import {
	getAvatarTone,
	getInitials,
} from "../../leads/utils/leadAvatars";
import { MEETING_STATUS_STYLES } from "../utils/meetingConstants";
import MeetingCommentsSection from "./MeetingCommentsSection";

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

function Field({ label, value }) {
	return (
		<div>
			<p className="text-xs font-medium uppercase tracking-wide text-muted">
				{label}
			</p>
			<p className="mt-1 text-sm text-text">
				{value == null || value === "" ? "—" : value}
			</p>
		</div>
	);
}

function PersonField({ label, person, userId }) {
	const missing = userId == null || userId === "" || Number(userId) === 0;
	const name = person
		? (person.name ?? person.email ?? `#${person.id}`)
		: missing
			? null
			: `#${userId}`;

	return (
		<div>
			<p className="text-xs font-medium uppercase tracking-wide text-muted">
				{label}
			</p>
			{name ? (
				<div className="mt-1.5 flex items-center gap-2">
					<span
						className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${getAvatarTone(name)}`}
					>
						{getInitials(name)}
					</span>
					<span className="text-sm text-text">{name}</span>
				</div>
			) : (
				<p className="mt-1 text-sm text-text">—</p>
			)}
		</div>
	);
}

function StatusBadge({ status, t }) {
	const style =
		MEETING_STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600";
	return (
		<span
			className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
		>
			{t(`meetings.statuses.${status}`, { defaultValue: status })}
		</span>
	);
}

function ModalSkeleton() {
	return (
		<div className="space-y-6">
			{Array.from({ length: 3 }).map((_, section) => (
				<div key={section} className="space-y-3">
					<div className="h-4 w-32 animate-pulse rounded bg-border/70" />
					<div className="grid grid-cols-2 gap-3">
						{Array.from({ length: 2 }).map((_, i) => (
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

const MeetingDetailModal = ({
	open,
	onClose,
	meeting,
	isLoading,
	isError,
	onRetry,
	preventClose = false,
	onEdit,
	onDelete,
	actionsDisabled = false,
}) => {
	const { t } = useTranslation();
	const titleId = useId();
	const dialogRef = useRef(null);
	const previousFocusRef = useRef(null);

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
			if (event.key === "Escape" && !preventClose) {
				event.preventDefault();
				onClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			previousFocusRef.current?.focus?.();
		};
	}, [open, onClose, preventClose]);

	const lead = meeting?.lead;
	const leadLabel = lead
		? [lead.name, lead.phone].filter(Boolean).join(" · ")
		: meeting?.lead_id
			? `#${meeting.lead_id}`
			: null;
	const leadStatus = lead?.status;

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
				className="animate-card-in relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
			>
				<div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
					<div className="min-w-0">
						<h2
							id={titleId}
							className="truncate text-lg font-semibold text-text sm:text-xl"
						>
							{t("meetings.drawer.title")}
						</h2>
						{meeting?.status && (
							<div className="mt-2">
								<StatusBadge status={meeting.status} t={t} />
							</div>
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

				<div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
					{isLoading && <ModalSkeleton />}

					{isError && !isLoading && (
						<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
							<p className="text-sm text-red-600">
								{t("meetings.errors.loadDetailFailed")}
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
					)}

					{meeting && !isLoading && (
						<div className="space-y-6">
							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("meetings.drawer.general")}
								</h3>
								<div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:grid-cols-2">
									<div>
										<p className="text-xs font-medium uppercase tracking-wide text-muted">
											{t("meetings.form.lead")}
										</p>
										{leadLabel ? (
											<div className="mt-1.5 flex flex-wrap items-center gap-2">
												<p className="text-sm text-text">{leadLabel}</p>
												{leadStatus ? (
													<span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
														{t(`leads.status.${leadStatus}`, {
															defaultValue: leadStatus,
														})}
													</span>
												) : null}
											</div>
										) : (
											<p className="mt-1 text-sm text-text">—</p>
										)}
									</div>
									<Field
										label={t("meetings.form.meetingDate")}
										value={formatDateTime(meeting.meeting_date)}
									/>
									<PersonField
										label={t("meetings.form.assignee")}
										person={meeting.assignee}
										userId={meeting.assigned_to}
									/>
									<PersonField
										label={t("meetings.drawer.createdBy")}
										person={meeting.creator}
										userId={meeting.created_by}
									/>
									<div className="sm:col-span-2">
										<Field
											label={t("meetings.form.notes")}
											value={meeting.notes}
										/>
									</div>
								</div>
							</section>

							<MeetingCommentsSection meeting={meeting} />

							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("meetings.drawer.timeline")}
								</h3>
								<div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:grid-cols-2">
									<Field
										label={t("meetings.drawer.createdAt")}
										value={formatDateTime(meeting.created_at)}
									/>
									<Field
										label={t("meetings.drawer.updatedAt")}
										value={formatDateTime(meeting.updated_at)}
									/>
								</div>
							</section>
						</div>
					)}
				</div>

				<div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border px-5 py-4 sm:px-6">
					{onEdit && (
						<button
							type="button"
							disabled={actionsDisabled || !meeting}
							onClick={() => onEdit(meeting)}
							className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-primary transition hover:bg-light-gold/60 disabled:opacity-50"
						>
							{t("meetings.actions.edit")}
						</button>
					)}
					{onDelete && (
						<button
							type="button"
							disabled={actionsDisabled || !meeting}
							onClick={() => onDelete(meeting)}
							className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
						>
							{t("meetings.actions.delete")}
						</button>
					)}
					<button
						type="button"
						onClick={onClose}
						disabled={preventClose}
						className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition hover:bg-background disabled:opacity-60"
					>
						{t("common.close")}
					</button>
				</div>
			</div>
		</div>
	);
};

export default MeetingDetailModal;

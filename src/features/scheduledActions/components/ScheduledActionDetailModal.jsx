import { X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	getAvatarTone,
	getInitials,
} from "../../leads/utils/leadAvatars";
import { SCHEDULED_ACTION_STATUS_STYLES } from "../utils/scheduledActionConstants";

const DRAWER_TABS = ["overview"];

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

function PersonField({ label, usersMap, userId }) {
	const missing = userId == null || userId === "" || Number(userId) === 0;
	const user = !missing
		? (usersMap?.get(Number(userId)) ?? usersMap?.get(String(userId)))
		: null;
	const name = user
		? (user.name ?? user.email ?? `#${user.id}`)
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
		SCHEDULED_ACTION_STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600";
	return (
		<span
			className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
		>
			{t(`scheduledActions.statuses.${status}`, { defaultValue: status })}
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

const ScheduledActionDetailModal = ({
	open,
	onClose,
	action,
	isLoading,
	isError,
	onRetry,
	preventClose = false,
	usersMap,
	leadsMap,
	clientsMap,
	onEdit,
	onComplete,
	onDelete,
	actionsDisabled = false,
}) => {
	const { t } = useTranslation();
	const titleId = useId();
	const dialogRef = useRef(null);
	const previousFocusRef = useRef(null);
	const [activeTab, setActiveTab] = useState("overview");

	useEffect(() => {
		if (open) setActiveTab("overview");
	}, [open, action?.id]);

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
			if (event.key === "Escape" && !preventClose) {
				event.preventDefault();
				onClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = previousOverflow;
			previousFocusRef.current?.focus?.();
		};
	}, [open, onClose, preventClose]);

	const typeLabel = action?.type
		? t(`scheduledActions.types.${action.type}`, {
				defaultValue: action.type,
			})
		: t("scheduledActions.drawer.title");

	const lead =
		action?.lead_id != null
			? (leadsMap?.get(Number(action.lead_id)) ??
				leadsMap?.get(String(action.lead_id)))
			: null;
	const client =
		action?.client_id != null
			? (clientsMap?.get(Number(action.client_id)) ??
				clientsMap?.get(String(action.client_id)))
			: null;

	const relatedLabel = lead
		? `${t("scheduledActions.form.relatedTypes.lead")}: ${lead.name ?? lead.phone ?? `#${lead.id}`}`
		: client
			? `${t("scheduledActions.form.relatedTypes.client")}: ${client.name ?? client.phone ?? `#${client.id}`}`
			: action?.lead_id
				? `${t("scheduledActions.form.relatedTypes.lead")} #${action.lead_id}`
				: action?.client_id
					? `${t("scheduledActions.form.relatedTypes.client")} #${action.client_id}`
					: null;

	const canComplete = action && action.status !== "completed";

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
							{typeLabel}
						</h2>
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
					<nav
						className="mb-5 flex gap-1 overflow-x-auto border-b border-border pb-px"
						aria-label={t("scheduledActions.drawer.tabsLabel")}
					>
						{DRAWER_TABS.map((tab) => {
							const isActive = activeTab === tab;
							return (
								<button
									key={tab}
									type="button"
									onClick={() => setActiveTab(tab)}
									className={[
										"shrink-0 rounded-t-lg px-3 py-2 text-sm font-medium transition",
										isActive
											? "border-b-2 border-gold text-text"
											: "text-muted hover:text-text",
									].join(" ")}
								>
									{t(`scheduledActions.drawer.tabs.${tab}`)}
								</button>
							);
						})}
					</nav>

					{isLoading && <ModalSkeleton />}

					{isError && !isLoading && (
						<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
							<p className="text-sm text-red-600">
								{t("scheduledActions.errors.loadDetailFailed")}
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

					{action && !isLoading && activeTab === "overview" && (
						<div className="space-y-6">
							<section className="flex flex-wrap items-center gap-2">
								<span className="inline-flex rounded-full bg-light-gold/70 px-2.5 py-0.5 text-xs font-medium capitalize text-primary">
									{typeLabel}
								</span>
								<StatusBadge status={action.status} t={t} />
							</section>

							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("scheduledActions.drawer.general")}
								</h3>
								<div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:grid-cols-2">
									<Field
										label={t("scheduledActions.form.relatedTo")}
										value={relatedLabel}
									/>
									<Field
										label={t("scheduledActions.form.scheduledAt")}
										value={formatDateTime(action.scheduled_at)}
									/>
									<PersonField
										label={t("scheduledActions.form.assignee")}
										usersMap={usersMap}
										userId={action.assigned_to}
									/>
									<PersonField
										label={t("scheduledActions.drawer.createdBy")}
										usersMap={usersMap}
										userId={action.created_by}
									/>
									<div className="sm:col-span-2">
										<Field
											label={t("scheduledActions.form.note")}
											value={action.note}
										/>
									</div>
									{action.outcome && (
										<div className="sm:col-span-2">
											<Field
												label={t("scheduledActions.complete.outcome")}
												value={action.outcome}
											/>
										</div>
									)}
								</div>
							</section>

							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("scheduledActions.drawer.timeline")}
								</h3>
								<div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:grid-cols-2">
									<Field
										label={t("scheduledActions.drawer.completedAt")}
										value={formatDateTime(action.completed_at)}
									/>
									<Field
										label={t("scheduledActions.drawer.createdAt")}
										value={formatDateTime(action.created_at)}
									/>
									<Field
										label={t("scheduledActions.drawer.updatedAt")}
										value={formatDateTime(action.updated_at)}
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
							disabled={actionsDisabled || !action}
							onClick={() => onEdit(action)}
							className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-primary transition hover:bg-light-gold/60 disabled:opacity-50"
						>
							{t("scheduledActions.actions.edit")}
						</button>
					)}
					{canComplete && onComplete && (
						<button
							type="button"
							disabled={actionsDisabled || !action}
							onClick={() => onComplete(action)}
							className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
						>
							{t("scheduledActions.actions.complete")}
						</button>
					)}
					{onDelete && (
						<button
							type="button"
							disabled={actionsDisabled || !action}
							onClick={() => onDelete(action)}
							className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
						>
							{t("scheduledActions.actions.delete")}
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

export default ScheduledActionDetailModal;

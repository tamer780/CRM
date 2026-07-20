import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useBodyScrollLock } from "../../../hooks/ui/useBodyScrollLock";
import {
	getAvatarTone,
	getInitials,
} from "../../leads/utils/leadAvatars";
import {
	getUserRole,
	getUserTeamName,
	isUserActive,
} from "../utils/userConstants";

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

function StatusBadge({ active, t }) {
	return (
		<span
			className={[
				"inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
				active
					? "bg-emerald-50 text-emerald-700"
					: "bg-red-50 text-red-700",
			].join(" ")}
		>
			{active ? t("users.status.active") : t("users.status.inactive")}
		</span>
	);
}

function ModalSkeleton() {
	return (
		<div className="space-y-6 p-5 sm:p-6">
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

const UserDetailModal = ({
	open,
	onClose,
	user,
	teams = [],
	isLoading,
	isError,
	onRetry,
	preventClose = false,
	onEdit,
	onToggleActive,
	onDelete,
	actionsDisabled = false,
	canManage = true,
}) => {
	const { t } = useTranslation();
	const titleId = useId();
	const dialogRef = useRef(null);
	const previousFocusRef = useRef(null);

	const displayName = user?.name ?? user?.email ?? t("users.drawer.title");
	const role = getUserRole(user);
	const active = isUserActive(user);
	const teamName = getUserTeamName(user, teams);

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
							{displayName}
						</h2>
						{user?.email && user?.name && (
							<p className="mt-1 truncate text-sm text-muted">
								{user.email}
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
					{isLoading && <ModalSkeleton />}

					{isError && !isLoading && (
						<div className="px-5 py-8 sm:px-6">
							<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
								<p className="text-sm text-red-600">
									{t("users.errors.loadDetailFailed")}
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

					{user && !isLoading && (
						<div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
							<section>
								<div className="flex items-center gap-3 rounded-2xl border border-border bg-background/40 p-4">
									<span
										className={`flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getAvatarTone(displayName)}`}
									>
										{getInitials(displayName)}
									</span>
									<div className="min-w-0 flex-1">
										<p className="truncate font-semibold text-text">
											{user.name ?? "—"}
										</p>
										<p className="truncate text-sm text-muted">
											{user.email ?? "—"}
										</p>
									</div>
									<StatusBadge active={active} t={t} />
								</div>
							</section>

							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("users.drawer.general")}
								</h3>
								<div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:grid-cols-2">
									<Field label={t("users.form.name")} value={user.name} />
									<Field label={t("users.form.email")} value={user.email} />
									<Field label={t("users.form.phone")} value={user.phone} />
									<Field label={t("users.form.team")} value={teamName} />
									<Field
										label={t("users.form.role")}
										value={
											role
												? t(`users.roles.${role}`, { defaultValue: role })
												: null
										}
									/>
									<Field
										label={t("users.form.jobTitle")}
										value={user.job_title}
									/>
								</div>
							</section>

							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("users.drawer.timeline")}
								</h3>
								<div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:grid-cols-2">
									<Field
										label={t("users.drawer.createdAt")}
										value={formatDateTime(user.created_at)}
									/>
									<Field
										label={t("users.drawer.updatedAt")}
										value={formatDateTime(user.updated_at)}
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
							disabled={actionsDisabled || !user || !canManage}
							onClick={() => onEdit(user)}
							className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-primary transition hover:bg-light-gold/60 disabled:opacity-50"
						>
							{t("users.actions.edit")}
						</button>
					)}
					{onToggleActive && (
						<button
							type="button"
							disabled={actionsDisabled || !user || !canManage}
							onClick={() => onToggleActive(user)}
							className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition hover:bg-background disabled:opacity-50"
						>
							{active
								? t("users.actions.deactivate")
								: t("users.actions.activate")}
						</button>
					)}
					{onDelete && (
						<button
							type="button"
							disabled={actionsDisabled || !user || !canManage}
							onClick={() => onDelete(user)}
							className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
						>
							{t("users.actions.delete")}
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

export default UserDetailModal;

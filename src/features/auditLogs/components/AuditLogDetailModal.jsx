import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useBodyScrollLock } from "../../../hooks/ui/useBodyScrollLock";
import {
	getAvatarTone,
	getInitials,
} from "../../leads/utils/leadAvatars";
import { formatJson, shortModelName } from "../utils/auditLogConstants";

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
			<p className="mt-1 break-all text-sm text-text">
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

function JsonBlock({ label, value, emptyLabel }) {
	const formatted = formatJson(value);
	return (
		<div>
			<p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
				{label}
			</p>
			{formatted ? (
				<pre className="max-h-48 overflow-auto rounded-xl border border-border bg-background/60 p-3 text-xs leading-relaxed text-text sm:max-h-56">
					{formatted}
				</pre>
			) : (
				<p className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted">
					{emptyLabel}
				</p>
			)}
		</div>
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

const AuditLogDetailModal = ({
	open,
	onClose,
	log,
	isLoading,
	isError,
	onRetry,
	preventClose = false,
	usersMap,
}) => {
	const { t } = useTranslation();
	const titleId = useId();
	const dialogRef = useRef(null);
	const previousFocusRef = useRef(null);

	const model = shortModelName(log?.auditable_type);
	const title = log?.action ?? t("auditLogs.drawer.title");
	const subtitle = model
		? `${model}${log?.auditable_id != null ? ` #${log.auditable_id}` : ""}`
		: undefined;

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
				className="animate-card-in relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
			>
				<div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
					<div className="min-w-0">
						<h2
							id={titleId}
							className="truncate font-mono text-lg font-semibold text-text sm:text-xl"
						>
							{title}
						</h2>
						{subtitle && (
							<p className="mt-1 text-sm text-muted">{subtitle}</p>
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
									{t("auditLogs.errors.loadDetailFailed")}
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

					{log && !isLoading && (
						<div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
							<section className="flex flex-wrap items-center gap-2">
								<span className="inline-flex rounded-full bg-light-gold/70 px-2.5 py-0.5 font-mono text-xs font-medium text-primary">
									{log.action}
								</span>
								{model && (
									<span className="inline-flex rounded-full bg-background px-2.5 py-0.5 text-xs font-medium text-muted">
										{model}
										{log.auditable_id != null
											? ` #${log.auditable_id}`
											: ""}
									</span>
								)}
							</section>

							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("auditLogs.drawer.general")}
								</h3>
								<div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:grid-cols-2">
									<PersonField
										label={t("auditLogs.columns.user")}
										usersMap={usersMap}
										userId={log.user_id}
									/>
									<Field
										label={t("auditLogs.columns.created")}
										value={formatDateTime(log.created_at)}
									/>
									<Field
										label={t("auditLogs.columns.ip")}
										value={log.ip_address}
									/>
									<div className="sm:col-span-2">
										<Field
											label={t("auditLogs.drawer.userAgent")}
											value={log.user_agent}
										/>
									</div>
								</div>
							</section>

							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("auditLogs.drawer.diff")}
								</h3>
								<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
									<JsonBlock
										label={t("auditLogs.drawer.oldValues")}
										value={log.old_values}
										emptyLabel={t("auditLogs.drawer.noOldValues")}
									/>
									<JsonBlock
										label={t("auditLogs.drawer.newValues")}
										value={log.new_values}
										emptyLabel={t("auditLogs.drawer.noNewValues")}
									/>
									<div className="lg:col-span-2">
										<JsonBlock
											label={t("auditLogs.drawer.metadata")}
											value={log.metadata}
											emptyLabel={t("auditLogs.drawer.noMetadata")}
										/>
									</div>
								</div>
							</section>
						</div>
					)}
				</div>

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
			</div>
		</div>
	);
};

export default AuditLogDetailModal;

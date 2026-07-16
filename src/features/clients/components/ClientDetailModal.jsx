import { X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import SourceBadge from "../../../components/ui/SourceBadge";
import {
	getAvatarTone,
	getInitials,
} from "../../leads/utils/leadAvatars";
import ClientStatusBadge from "./ClientStatusBadge";

const DRAWER_TABS = ["overview", "activities", "comments", "timeline", "files"];

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

function ModalSkeleton() {
	return (
		<div className="space-y-6 p-5 sm:p-6">
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

function resolveEntity(map, id) {
	if (id == null || id === "") return "—";
	const item = map?.get(Number(id)) ?? map?.get(String(id));
	if (!item) return String(id);
	return item.name ?? item.title ?? item.email ?? String(id);
}

const ClientDetailModal = ({
	open,
	onClose,
	client,
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
	const dialogRef = useRef(null);
	const previousFocusRef = useRef(null);
	const [activeTab, setActiveTab] = useState("overview");

	useEffect(() => {
		if (open) setActiveTab("overview");
	}, [open, client?.id]);

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

	const assignedUser =
		client?.assigned_to != null
			? (usersMap?.get(Number(client.assigned_to)) ??
				usersMap?.get(String(client.assigned_to)))
			: null;
	const assignedName = assignedUser
		? (assignedUser.name ?? assignedUser.email ?? `#${assignedUser.id}`)
		: null;

	const lostByUser =
		client?.lost_by != null
			? (usersMap?.get(Number(client.lost_by)) ??
				usersMap?.get(String(client.lost_by)))
			: null;
	const lostByName = lostByUser
		? (lostByUser.name ?? lostByUser.email ?? `#${lostByUser.id}`)
		: client?.lost_by != null
			? String(client.lost_by)
			: null;

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
							className="truncate text-lg font-semibold text-text sm:text-xl"
						>
							{client?.name ?? t("clients.drawer.title")}
						</h2>
						{client?.email && (
							<p className="mt-1 truncate text-sm text-muted">
								{client.email}
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

				<div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
					<nav
						className="mb-5 flex gap-1 overflow-x-auto border-b border-border pb-px"
						aria-label={t("clients.drawer.tabsLabel")}
					>
						{DRAWER_TABS.map((tab) => {
							const disabled = tab !== "overview";
							const isActive = activeTab === tab;
							return (
								<button
									key={tab}
									type="button"
									disabled={disabled}
									onClick={() => !disabled && setActiveTab(tab)}
									className={[
										"shrink-0 rounded-t-lg px-3 py-2 text-sm font-medium transition",
										isActive
											? "border-b-2 border-gold text-text"
											: disabled
												? "cursor-not-allowed text-muted/50"
												: "text-muted hover:text-text",
									].join(" ")}
									title={
										disabled ? t("clients.drawer.comingSoon") : undefined
									}
								>
									{t(`clients.drawer.tabs.${tab}`)}
								</button>
							);
						})}
					</nav>

					{isLoading && <ModalSkeleton />}

					{isError && !isLoading && (
						<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
							<p className="text-sm text-red-600">
								{t("clients.errors.loadDetailFailed")}
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

					{client && !isLoading && activeTab === "overview" && (
						<div className="space-y-6">
							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("clients.drawer.general")}
								</h3>
								<div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:grid-cols-2">
									<Field label={t("clients.form.name")} value={client.name} />
									<div>
										<p className="text-xs font-medium uppercase tracking-wide text-muted">
											{t("clients.form.phone")}
										</p>
										{client.phone ? (
											<a
												href={`tel:${client.phone}`}
												className="mt-1 block text-sm font-medium text-primary underline-offset-2 hover:underline"
												dir="ltr"
											>
												{client.phone}
											</a>
										) : (
											<p className="mt-1 text-sm text-text">—</p>
										)}
									</div>
									<Field label={t("clients.form.email")} value={client.email} />
									<div>
										<p className="text-xs font-medium uppercase tracking-wide text-muted">
											{t("clients.form.status")}
										</p>
										<div className="mt-1.5">
											<ClientStatusBadge status={client.status} />
										</div>
									</div>
									<Field
										label={t("clients.drawer.originalLeadId")}
										value={client.original_lead_id}
									/>
								</div>
							</section>

							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("clients.drawer.assignment")}
								</h3>
								<div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:grid-cols-2">
									<div>
										<p className="text-xs font-medium uppercase tracking-wide text-muted">
											{t("clients.form.assignedTo")}
										</p>
										{assignedName ? (
											<div className="mt-1.5 flex items-center gap-2">
												<span
													className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${getAvatarTone(assignedName)}`}
												>
													{getInitials(assignedName)}
												</span>
												<span className="text-sm text-text">{assignedName}</span>
											</div>
										) : (
											<p className="mt-1 text-sm text-text">—</p>
										)}
									</div>
									<Field
										label={t("clients.form.project")}
										value={resolveEntity(projectsMap, client.project_id)}
									/>
									<Field
										label={t("clients.form.campaign")}
										value={resolveEntity(campaignsMap, client.campaign_id)}
									/>
									<div>
										<p className="text-xs font-medium uppercase tracking-wide text-muted">
											{t("clients.form.source")}
										</p>
										<div className="mt-1.5">
											<SourceBadge source={client.source} />
										</div>
									</div>
								</div>
							</section>

							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("clients.drawer.timeline")}
								</h3>
								<div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:grid-cols-2">
									<Field
										label={t("clients.drawer.qualifiedAt")}
										value={formatDateTime(client.qualified_at)}
									/>
									<Field
										label={t("clients.drawer.convertedAt")}
										value={formatDateTime(client.converted_at)}
									/>
									<Field
										label={t("clients.drawer.createdAt")}
										value={formatDateTime(client.created_at)}
									/>
									<Field
										label={t("clients.drawer.updatedAt")}
										value={formatDateTime(client.updated_at)}
									/>
								</div>
							</section>

							{client.status === "lost" && (
								<section>
									<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
										{t("clients.drawer.lostInfo")}
									</h3>
									<div className="grid grid-cols-1 gap-4 rounded-2xl border border-red-100 bg-red-50/40 p-4 sm:grid-cols-2">
										<Field
											label={t("clients.drawer.lostAt")}
											value={formatDateTime(client.lost_at)}
										/>
										<Field
											label={t("clients.drawer.lostBy")}
											value={lostByName}
										/>
										<div className="sm:col-span-2">
											<Field
												label={t("clients.drawer.lostReason")}
												value={client.lost_reason}
											/>
										</div>
									</div>
								</section>
							)}
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

export default ClientDetailModal;

import { X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBodyScrollLock } from "../../../hooks/ui/useBodyScrollLock";
import SourceBadge from "../../../components/ui/SourceBadge";
import {
	getAvatarTone,
	getInitials,
} from "../../leads/utils/leadAvatars";
import {
	clientHasLostInfo,
	formatClientDateTime,
	getClientDetailTabs,
	resolveUserName,
} from "../utils/clientDetailUtils";
import { nestedEntityName } from "../../../utils/api/nestedRelations";
import ClientStatusBadge from "./ClientStatusBadge";
import ClientActivitiesTab from "./detail/ClientActivitiesTab";
import ClientCommentsTab from "./detail/ClientCommentsTab";
import ClientScheduledActionsTab from "./detail/ClientScheduledActionsTab";
import ClientTimelineTab from "./detail/ClientTimelineTab";

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

const ClientDetailModal = ({
	open,
	onClose,
	client,
	isDetailReady = false,
	isLoading,
	isError,
	onRetry,
	preventClose = false,
	users = [],
}) => {
	const { t } = useTranslation();
	const titleId = useId();
	const dialogRef = useRef(null);
	const previousFocusRef = useRef(null);
	const [activeTab, setActiveTab] = useState("overview");

	const visibleTabs = useMemo(
		() => (isDetailReady ? getClientDetailTabs(client) : ["overview"]),
		[client, isDetailReady],
	);

	useBodyScrollLock(open);

	useEffect(() => {
		if (open) setActiveTab("overview");
	}, [open, client?.id]);

	useEffect(() => {
		if (!visibleTabs.includes(activeTab)) {
			setActiveTab("overview");
		}
	}, [visibleTabs, activeTab]);

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

	const assignedName = nestedEntityName(client?.assignee);
	const hasAssigned = client?.assignee != null;

	const lostByName =
		client?.lost_by_user != null
			? nestedEntityName(client.lost_by_user)
			: resolveUserName(users, client?.lost_by);

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
					{client && visibleTabs.length > 1 && (
						<nav
							className="mb-5 flex gap-1 overflow-x-auto border-b border-border pb-px"
							aria-label={t("clients.drawer.tabsLabel")}
							role="tablist"
						>
							{visibleTabs.map((tab) => {
								const isActive = activeTab === tab;
								return (
									<button
										key={tab}
										type="button"
										role="tab"
										aria-selected={isActive}
										id={`client-detail-tab-${tab}`}
										aria-controls={`client-detail-panel-${tab}`}
										onClick={() => setActiveTab(tab)}
										className={[
											"shrink-0 rounded-t-lg px-3 py-2 text-sm font-medium transition",
											isActive
												? "border-b-2 border-gold text-text"
												: "text-muted hover:text-text",
										].join(" ")}
									>
										{t(`clients.drawer.tabs.${tab}`)}
									</button>
								);
							})}
						</nav>
					)}

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
						<div
							id="client-detail-panel-overview"
							role="tabpanel"
							aria-labelledby="client-detail-tab-overview"
							className="space-y-6"
						>
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
										{hasAssigned ? (
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
										label={t("clients.drawer.team")}
										value={nestedEntityName(client.team)}
									/>
									<Field
										label={t("clients.form.project")}
										value={nestedEntityName(client.project)}
									/>
									<Field
										label={t("clients.form.campaign")}
										value={nestedEntityName(client.campaign)}
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
									{t("clients.drawer.dates")}
								</h3>
								<div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:grid-cols-2">
									<Field
										label={t("clients.drawer.qualifiedAt")}
										value={formatClientDateTime(client.qualified_at)}
									/>
									<Field
										label={t("clients.drawer.convertedAt")}
										value={formatClientDateTime(client.converted_at)}
									/>
									<Field
										label={t("clients.drawer.createdAt")}
										value={formatClientDateTime(client.created_at)}
									/>
									<Field
										label={t("clients.drawer.updatedAt")}
										value={formatClientDateTime(client.updated_at)}
									/>
								</div>
							</section>

							{clientHasLostInfo(client) && (
								<section>
									<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
										{t("clients.drawer.lostInfo")}
									</h3>
									<div className="grid grid-cols-1 gap-4 rounded-2xl border border-red-100 bg-red-50/40 p-4 sm:grid-cols-2">
										<Field
											label={t("clients.drawer.lostAt")}
											value={formatClientDateTime(client.lost_at)}
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

					{client && !isLoading && isDetailReady && activeTab === "activities" && (
						<div
							id="client-detail-panel-activities"
							role="tabpanel"
							aria-labelledby="client-detail-tab-activities"
						>
							<ClientActivitiesTab activities={client.activities} />
						</div>
					)}

					{client && !isLoading && isDetailReady && activeTab === "comments" && (
						<div
							id="client-detail-panel-comments"
							role="tabpanel"
							aria-labelledby="client-detail-tab-comments"
						>
							<ClientCommentsTab comments={client.comments} />
						</div>
					)}

					{client && !isLoading && isDetailReady && activeTab === "timeline" && (
						<div
							id="client-detail-panel-timeline"
							role="tabpanel"
							aria-labelledby="client-detail-tab-timeline"
						>
							<ClientTimelineTab timeline={client.timeline} />
						</div>
					)}

					{client &&
						!isLoading &&
						isDetailReady &&
						activeTab === "scheduledActions" && (
						<div
							id="client-detail-panel-scheduledActions"
							role="tabpanel"
							aria-labelledby="client-detail-tab-scheduledActions"
						>
							<ClientScheduledActionsTab
								scheduledActions={client.scheduled_actions}
								users={users}
							/>
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

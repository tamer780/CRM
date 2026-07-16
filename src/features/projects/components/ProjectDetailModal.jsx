import { X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	getAvatarTone,
	getInitials,
} from "../../leads/utils/leadAvatars";
import ProjectStatusBadge from "./ProjectStatusBadge";

const DRAWER_TABS = ["overview", "leads", "campaigns", "files"];

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
		<div className="space-y-6">
			{Array.from({ length: 3 }).map((_, section) => (
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

const ProjectDetailModal = ({
	open,
	onClose,
	project,
	isLoading,
	isError,
	onRetry,
	preventClose = false,
	usersMap,
	projectTeams = [],
	teamsLoading = false,
}) => {
	const { t } = useTranslation();
	const titleId = useId();
	const dialogRef = useRef(null);
	const previousFocusRef = useRef(null);
	const [activeTab, setActiveTab] = useState("overview");

	useEffect(() => {
		if (open) setActiveTab("overview");
	}, [open, project?.id]);

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

	const creator =
		project?.created_by != null
			? (usersMap?.get(Number(project.created_by)) ??
				usersMap?.get(String(project.created_by)))
			: null;
	const creatorName = creator
		? (creator.name ?? creator.email ?? `#${creator.id}`)
		: project?.created_by != null
			? `#${project.created_by}`
			: null;

	const teamsList =
		projectTeams?.length > 0 ? projectTeams : (project?.teams ?? []);

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
							{project?.name ?? t("projects.drawer.title")}
						</h2>
						{project?.status && (
							<p className="mt-1 text-sm text-muted">
								{t(`projects.status.${project.status}`)}
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
						aria-label={t("projects.drawer.tabsLabel")}
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
										disabled ? t("projects.drawer.comingSoon") : undefined
									}
								>
									{t(`projects.drawer.tabs.${tab}`)}
								</button>
							);
						})}
					</nav>

					{isLoading && <ModalSkeleton />}

					{isError && !isLoading && (
						<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
							<p className="text-sm text-red-600">
								{t("projects.errors.loadDetailFailed")}
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

					{project && !isLoading && activeTab === "overview" && (
						<div className="space-y-6">
							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("projects.drawer.general")}
								</h3>
								<div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:grid-cols-2">
									<Field label={t("projects.form.name")} value={project.name} />
									<div>
										<p className="text-xs font-medium uppercase tracking-wide text-muted">
											{t("projects.form.status")}
										</p>
										<div className="mt-1.5">
											<ProjectStatusBadge status={project.status} />
										</div>
									</div>
									<div className="sm:col-span-2">
										<Field
											label={t("projects.form.description")}
											value={project.description}
										/>
									</div>
									<Field
										label={t("projects.form.startedAt")}
										value={formatDateTime(project.started_at)}
									/>
								</div>
							</section>

							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("projects.drawer.teams")}
								</h3>
								<div className="rounded-2xl border border-border bg-background/40 p-4">
									{teamsLoading ? (
										<div className="space-y-2">
											{Array.from({ length: 2 }).map((_, i) => (
												<div
													key={i}
													className="h-10 animate-pulse rounded-xl bg-border/50"
												/>
											))}
										</div>
									) : teamsList.length === 0 ? (
										<p className="text-sm text-muted">
											{t("projects.drawer.noTeams")}
										</p>
									) : (
										<ul className="space-y-2">
											{teamsList.map((team) => {
												const name = team.name ?? `#${team.id}`;
												return (
													<li
														key={team.id}
														className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface px-3 py-2.5"
													>
														<span
															className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarTone(name)}`}
														>
															{getInitials(name)}
														</span>
														<div className="min-w-0 flex-1">
															<p className="truncate text-sm font-medium text-text">
																{name}
															</p>
															{(team.team_leader_id != null ||
																team.supervisor_id != null) && (
																<p className="text-xs text-muted">
																	{[
																		team.team_leader_id != null
																			? t("projects.drawer.leaderId", {
																					id: team.team_leader_id,
																				})
																			: null,
																		team.supervisor_id != null
																			? t("projects.drawer.supervisorId", {
																					id: team.supervisor_id,
																				})
																			: null,
																	]
																		.filter(Boolean)
																		.join(" · ")}
																</p>
															)}
														</div>
													</li>
												);
											})}
										</ul>
									)}
								</div>
							</section>

							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("projects.drawer.meta")}
								</h3>
								<div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:grid-cols-2">
									<div>
										<p className="text-xs font-medium uppercase tracking-wide text-muted">
											{t("projects.drawer.createdBy")}
										</p>
										{creatorName ? (
											<div className="mt-1.5 flex items-center gap-2">
												<span
													className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${getAvatarTone(creatorName)}`}
												>
													{getInitials(creatorName)}
												</span>
												<span className="text-sm text-text">{creatorName}</span>
											</div>
										) : (
											<p className="mt-1 text-sm text-text">—</p>
										)}
									</div>
									<Field
										label={t("projects.drawer.createdAt")}
										value={formatDateTime(project.created_at)}
									/>
									<Field
										label={t("projects.drawer.updatedAt")}
										value={formatDateTime(project.updated_at)}
									/>
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

export default ProjectDetailModal;

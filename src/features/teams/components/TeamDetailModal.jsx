import { X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBodyScrollLock } from "../../../hooks/ui/useBodyScrollLock";
import {
	getAvatarTone,
	getInitials,
} from "../../leads/utils/leadAvatars";
import ProjectStatusBadge from "../../projects/components/ProjectStatusBadge";
import {
	getTeamMembers,
	getTeamProjects,
	personDisplayName,
	resolveTeamPerson,
} from "../utils/teamConstants";

const DRAWER_TABS = ["overview", "members", "projects"];

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

function RoleChip({ role }) {
	if (!role) return null;
	return (
		<span className="inline-flex rounded-full bg-background px-2 py-0.5 text-[11px] font-medium text-muted ring-1 ring-inset ring-border">
			{role}
		</span>
	);
}

function PersonField({ label, person, t }) {
	const name = personDisplayName(person);
	const email = person?.email;
	const role = Array.isArray(person?.roles) ? person.roles[0] : null;
	const inactive = person?.is_active === false;

	return (
		<div>
			<p className="text-xs font-medium uppercase tracking-wide text-muted">
				{label}
			</p>
			{name ? (
				<div className={`mt-1.5 flex items-start gap-2 ${inactive ? "opacity-60" : ""}`}>
					<span
						className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${getAvatarTone(name)}`}
					>
						{getInitials(name)}
					</span>
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-sm font-medium text-text">{name}</span>
							{inactive ? <StatusBadge active={false} t={t} /> : null}
						</div>
						{email ? (
							<p className="truncate text-xs text-muted">{email}</p>
						) : null}
						{role ? (
							<div className="mt-1">
								<RoleChip role={role} />
							</div>
						) : null}
					</div>
				</div>
			) : (
				<p className="mt-1 text-sm text-text">—</p>
			)}
		</div>
	);
}

function MemberRow({ member, t }) {
	const name = personDisplayName(member) ?? "—";
	const inactive = member?.is_active === false;
	const roles = Array.isArray(member?.roles) ? member.roles : [];

	return (
		<li
			className={[
				"flex items-start gap-3 rounded-xl border border-border/60 bg-surface px-3 py-2.5",
				inactive ? "opacity-60" : "",
			].join(" ")}
		>
			<span
				className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarTone(name)}`}
			>
				{getInitials(name)}
			</span>
			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-2">
					<p className="truncate text-sm font-medium text-text">{name}</p>
					<StatusBadge active={!inactive} t={t} />
				</div>
				{member?.email ? (
					<p className="truncate text-xs text-muted">{member.email}</p>
				) : null}
				{roles.length > 0 ? (
					<div className="mt-1.5 flex flex-wrap gap-1">
						{roles.map((role) => (
							<RoleChip key={role} role={role} />
						))}
					</div>
				) : null}
			</div>
		</li>
	);
}

function ProjectRow({ project }) {
	const name = project?.name ?? (project?.id != null ? `#${project.id}` : "—");

	return (
		<li className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface px-3 py-2.5">
			<span
				className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarTone(name)}`}
			>
				{getInitials(name)}
			</span>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium text-text">{name}</p>
			</div>
			<ProjectStatusBadge status={project?.status} />
		</li>
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

const TeamDetailModal = ({
	open,
	onClose,
	team,
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
	const [activeTab, setActiveTab] = useState("overview");

	const leader = resolveTeamPerson(
		team,
		"team_leader",
		"team_leader_id",
		usersMap,
	);
	const supervisor = resolveTeamPerson(
		team,
		"supervisor",
		"supervisor_id",
		usersMap,
	);
	const members = getTeamMembers(team);
	const projects = getTeamProjects(team);

	useBodyScrollLock(open);

	useEffect(() => {
		if (open) setActiveTab("overview");
	}, [open, team?.id]);

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
							{team?.name ?? t("teams.drawer.title")}
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
						aria-label={t("teams.drawer.tabsLabel")}
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
									{t(`teams.drawer.tabs.${tab}`)}
								</button>
							);
						})}
					</nav>

					{isLoading && <ModalSkeleton />}

					{isError && !isLoading && (
						<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
							<p className="text-sm text-red-600">
								{t("teams.errors.loadDetailFailed")}
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

					{team && !isLoading && activeTab === "overview" && (
						<div className="space-y-6">
							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("teams.drawer.general")}
								</h3>
								<div className="rounded-2xl border border-border bg-background/40 p-4">
									<Field label={t("teams.form.name")} value={team.name} />
								</div>
							</section>

							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("teams.drawer.leadership")}
								</h3>
								<div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:grid-cols-2">
									<PersonField
										label={t("teams.form.leader")}
										person={leader}
										t={t}
									/>
									<PersonField
										label={t("teams.form.supervisor")}
										person={supervisor}
										t={t}
									/>
								</div>
							</section>

							<section>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
									{t("teams.drawer.timeline")}
								</h3>
								<div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:grid-cols-2">
									<Field
										label={t("teams.drawer.createdAt")}
										value={formatDateTime(team.created_at)}
									/>
									<Field
										label={t("teams.drawer.updatedAt")}
										value={formatDateTime(team.updated_at)}
									/>
								</div>
							</section>
						</div>
					)}

					{team && !isLoading && activeTab === "members" && (
						<div>
							{members.length === 0 ? (
								<p className="rounded-xl border border-border bg-background/40 px-4 py-8 text-center text-sm text-muted">
									{t("teams.drawer.noMembers")}
								</p>
							) : (
								<ul className="space-y-2">
									{members.map((member) => (
										<MemberRow
											key={member.id ?? member.email ?? member.name}
											member={member}
											t={t}
										/>
									))}
								</ul>
							)}
						</div>
					)}

					{team && !isLoading && activeTab === "projects" && (
						<div>
							{projects.length === 0 ? (
								<p className="rounded-xl border border-border bg-background/40 px-4 py-8 text-center text-sm text-muted">
									{t("teams.drawer.noProjects")}
								</p>
							) : (
								<ul className="space-y-2">
									{projects.map((project) => (
										<ProjectRow
											key={project.id ?? project.name}
											project={project}
										/>
									))}
								</ul>
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

export default TeamDetailModal;

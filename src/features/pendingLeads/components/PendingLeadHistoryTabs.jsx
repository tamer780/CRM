import { GitBranch, History, MessageSquareText } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAvatarTone, getInitials } from "../../leads/utils/leadAvatars";
import {
	sortActivitiesDesc,
	sortAssignmentsDesc,
	sortCommentsDesc,
} from "../utils/activityDiff";
import PendingLeadActivityItem from "./PendingLeadActivityItem";

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

function resolveUserLabel(usersMap, id) {
	if (id == null || id === "") return "—";
	const user = usersMap?.get(Number(id)) ?? usersMap?.get(String(id));
	if (!user) return `#${id}`;
	return user.name ?? user.email ?? `#${id}`;
}

function EmptyState({ title, message }) {
	return (
		<div className="px-4 py-10 text-center">
			<p className="text-sm font-medium text-text">{title}</p>
			<p className="mt-1 text-sm text-muted">{message}</p>
		</div>
	);
}

function CommentsList({ comments, usersMap }) {
	const { t } = useTranslation();
	const sorted = useMemo(() => sortCommentsDesc(comments), [comments]);

	if (sorted.length === 0) {
		return (
			<EmptyState
				title={t("pendingLeads.drawer.commentsEmptyTitle")}
				message={t("pendingLeads.drawer.commentsEmptyMessage")}
			/>
		);
	}

	return (
		<ul className="space-y-3 px-1 py-1">
			{sorted.map((comment) => {
				const author =
					comment?.user?.name ??
					resolveUserLabel(usersMap, comment?.user_id);
				return (
					<li
						key={comment.id}
						className="flex gap-3 rounded-xl border border-border bg-background/40 px-3 py-3"
					>
						<span
							className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${getAvatarTone(author)}`}
						>
							{getInitials(author)}
						</span>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-baseline justify-between gap-2">
								<p className="text-sm font-medium text-text">{author}</p>
								<time className="text-xs text-muted">
									{formatDateTime(comment.created_at)}
								</time>
							</div>
							<p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-text">
								{comment.body}
							</p>
						</div>
					</li>
				);
			})}
		</ul>
	);
}

function AssignmentsList({ assignments, usersMap }) {
	const { t } = useTranslation();
	const sorted = useMemo(
		() => sortAssignmentsDesc(assignments),
		[assignments],
	);

	if (sorted.length === 0) {
		return (
			<EmptyState
				title={t("pendingLeads.drawer.assignmentsEmptyTitle")}
				message={t("pendingLeads.drawer.assignmentsEmptyMessage")}
			/>
		);
	}

	return (
		<ul className="space-y-2 px-1 py-1">
			{sorted.map((item) => {
				const fromUser = resolveUserLabel(
					usersMap,
					item.previous_assigned_to,
				);
				const toUser = resolveUserLabel(usersMap, item.new_assigned_to);
				const changedBy = resolveUserLabel(usersMap, item.changed_by);

				return (
					<li
						key={item.id}
						className="rounded-xl border border-border bg-background/40 px-3 py-3"
					>
						<div className="flex flex-wrap items-start justify-between gap-2">
							<p className="text-sm text-text">
								<span className="text-muted">{fromUser}</span>
								{" → "}
								<span className="font-medium">{toUser}</span>
							</p>
							{item.is_active ? (
								<span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
									{t("pendingLeads.drawer.activeAssignment")}
								</span>
							) : (
								<span className="inline-flex rounded-full bg-background px-2 py-0.5 text-[11px] font-medium text-muted ring-1 ring-inset ring-border">
									{t("pendingLeads.drawer.endedAssignment")}
								</span>
							)}
						</div>
						{item.reason && (
							<p className="mt-1.5 text-sm text-muted">
								{t("pendingLeads.drawer.reason")}:{" "}
								<span className="text-text">{item.reason}</span>
							</p>
						)}
						<div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
							<span>
								{t("pendingLeads.drawer.changedBy")}: {changedBy}
							</span>
							<span>
								{t("pendingLeads.drawer.assignedAt")}:{" "}
								{formatDateTime(item.assigned_at)}
							</span>
							{item.ended_at && (
								<span>
									{t("pendingLeads.drawer.endedAt")}:{" "}
									{formatDateTime(item.ended_at)}
								</span>
							)}
						</div>
					</li>
				);
			})}
		</ul>
	);
}

function ActivityList({ activities, usersMap }) {
	const { t } = useTranslation();
	const sorted = useMemo(() => sortActivitiesDesc(activities), [activities]);

	if (sorted.length === 0) {
		return (
			<EmptyState
				title={t("pendingLeads.drawer.activityEmptyTitle")}
				message={t("pendingLeads.drawer.activityEmptyMessage")}
			/>
		);
	}

	return (
		<ul className="relative space-y-3 border-s border-border ms-1.5 py-1">
			{sorted.map((activity) => (
				<PendingLeadActivityItem
					key={activity.id}
					activity={activity}
					usersMap={usersMap}
				/>
			))}
		</ul>
	);
}

const PendingLeadHistoryTabs = ({ existingLead, usersMap }) => {
	const { t } = useTranslation();
	const [tab, setTab] = useState("comments");

	const comments = existingLead?.comments ?? [];
	const activities = existingLead?.activities ?? [];
	const assignments = existingLead?.assignments ?? [];

	const tabs = [
		{
			id: "comments",
			label: t("pendingLeads.drawer.tabComments"),
			icon: MessageSquareText,
			count: comments.length,
		},
		{
			id: "activity",
			label: t("pendingLeads.drawer.tabActivity"),
			icon: History,
			count: activities.length,
		},
		{
			id: "assignments",
			label: t("pendingLeads.drawer.tabAssignments"),
			icon: GitBranch,
			count: assignments.length,
		},
	];

	if (!existingLead) {
		return (
			<section className="rounded-2xl border border-dashed border-border px-4 py-8 text-center">
				<p className="text-sm font-medium text-text">
					{t("pendingLeads.drawer.historyUnavailableTitle")}
				</p>
				<p className="mt-1 text-sm text-muted">
					{t("pendingLeads.drawer.historyUnavailableMessage")}
				</p>
			</section>
		);
	}

	return (
		<section className="overflow-hidden rounded-2xl border border-border bg-surface">
			<div className="border-b border-border px-4 pt-3 sm:px-5">
				<h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
					{t("pendingLeads.drawer.existingHistory")}
				</h3>
				<div
					className="flex gap-1 overflow-x-auto"
					role="tablist"
					aria-label={t("pendingLeads.drawer.existingHistory")}
				>
					{tabs.map(({ id, label, icon: Icon, count }) => {
						const selected = tab === id;
						return (
							<button
								key={id}
								type="button"
								role="tab"
								aria-selected={selected}
								id={`pending-history-tab-${id}`}
								aria-controls={`pending-history-panel-${id}`}
								onClick={() => setTab(id)}
								className={[
									"inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition",
									selected
										? "border-gold text-text"
										: "border-transparent text-muted hover:text-text",
								].join(" ")}
							>
								<Icon className="size-3.5" aria-hidden="true" />
								{label}
								<span
									className={[
										"rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
										selected
											? "bg-gold/20 text-primary"
											: "bg-background text-muted",
									].join(" ")}
								>
									{count}
								</span>
							</button>
						);
					})}
				</div>
			</div>

			<div
				role="tabpanel"
				id={`pending-history-panel-${tab}`}
				aria-labelledby={`pending-history-tab-${tab}`}
				className="max-h-80 overflow-y-auto px-3 py-3 sm:px-4"
			>
				{tab === "comments" && (
					<CommentsList comments={comments} usersMap={usersMap} />
				)}
				{tab === "activity" && (
					<ActivityList activities={activities} usersMap={usersMap} />
				)}
				{tab === "assignments" && (
					<AssignmentsList
						assignments={assignments}
						usersMap={usersMap}
					/>
				)}
			</div>
		</section>
	);
};

export default PendingLeadHistoryTabs;

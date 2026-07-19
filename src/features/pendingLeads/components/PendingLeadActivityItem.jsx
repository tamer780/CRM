import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatJson } from "../../auditLogs/utils/auditLogConstants";
import LeadStatusBadge from "../../leads/components/table/LeadStatusBadge";
import { getAvatarTone, getInitials } from "../../leads/utils/leadAvatars";
import { getChangedFields } from "../utils/activityDiff";

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
	if (id == null || id === "") return null;
	const user = usersMap?.get(Number(id)) ?? usersMap?.get(String(id));
	if (!user) return `#${id}`;
	return user.name ?? user.email ?? `#${id}`;
}

function formatFieldValue(key, value, usersMap, t) {
	if (value == null || value === "") return "—";
	if (key === "status") {
		return <LeadStatusBadge status={value} />;
	}
	if (key === "assigned_to" || key === "assigned_by" || key === "created_by") {
		return resolveUserLabel(usersMap, value) ?? String(value);
	}
	if (
		key.endsWith("_at") ||
		key === "created_at" ||
		key === "updated_at" ||
		key === "lost_at" ||
		key === "qualified_at"
	) {
		return formatDateTime(value);
	}
	if (typeof value === "object") {
		return formatJson(value) ?? "—";
	}
	if (key === "status" && typeof value === "string") {
		return t(`leads.status.${value}`, {
			defaultValue: String(value).replaceAll("_", " "),
		});
	}
	return String(value);
}

function DiffValue({ children }) {
	if (typeof children === "string" || typeof children === "number") {
		return <span className="text-sm text-text">{children}</span>;
	}
	return <div className="inline-flex items-center">{children}</div>;
}

const PendingLeadActivityItem = ({ activity, usersMap }) => {
	const { t } = useTranslation();
	const [showRaw, setShowRaw] = useState(false);

	const changes = useMemo(
		() => getChangedFields(activity?.old_value, activity?.new_value),
		[activity?.old_value, activity?.new_value],
	);

	const actorName = resolveUserLabel(usersMap, activity?.user_id);
	const typeKey = String(activity?.type ?? "").toLowerCase();
	const typeLabel = t(`pendingLeads.activityTypes.${typeKey}`, {
		defaultValue: typeKey
			? typeKey.replaceAll("_", " ")
			: t("pendingLeads.drawer.unknownActivity"),
	});

	const metadataReason =
		activity?.metadata?.reason != null
			? String(activity.metadata.reason)
			: null;
	const metadataAssigneeId = activity?.metadata?.assignee_id;
	const hasSnapshots =
		activity?.old_value != null || activity?.new_value != null;

	const isAssignType =
		typeKey === "lead_assigned" || typeKey === "lead_reassigned";
	const isStatusType =
		typeKey === "status_changed" || typeKey === "lead_lost";

	const statusChange = changes.find((c) => c.key === "status");
	const lostReasonChange = changes.find((c) => c.key === "lost_reason");
	const assigneeChange = changes.find((c) => c.key === "assigned_to");

	const displayChanges = changes.filter((c) => {
		if (isStatusType && (c.key === "status" || c.key === "lost_reason")) {
			return false;
		}
		if (isAssignType && c.key === "assigned_to") return false;
		return true;
	});

	return (
		<li className="relative ps-6">
			<span
				className="absolute start-0 top-2 size-2.5 rounded-full bg-gold ring-4 ring-surface"
				aria-hidden="true"
			/>
			<div className="rounded-xl border border-border bg-background/40 px-3 py-3">
				<div className="flex flex-wrap items-start justify-between gap-2">
					<div className="min-w-0">
						<p className="text-sm font-medium capitalize text-text">
							{typeLabel}
						</p>
						{activity?.description && (
							<p className="mt-0.5 text-sm text-muted">
								{activity.description}
							</p>
						)}
					</div>
					<time className="shrink-0 text-xs text-muted">
						{formatDateTime(activity?.occurred_at ?? activity?.created_at)}
					</time>
				</div>

				{actorName && (
					<div className="mt-2 flex items-center gap-2">
						<span
							className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${getAvatarTone(actorName)}`}
						>
							{getInitials(actorName)}
						</span>
						<span className="text-xs text-muted">{actorName}</span>
					</div>
				)}

				{isStatusType && statusChange && (
					<div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-surface px-2.5 py-2 ring-1 ring-inset ring-border">
						<DiffValue>
							{formatFieldValue("status", statusChange.from, usersMap, t)}
						</DiffValue>
						<span className="text-xs text-muted" aria-hidden="true">
							→
						</span>
						<DiffValue>
							{formatFieldValue("status", statusChange.to, usersMap, t)}
						</DiffValue>
						{lostReasonChange?.to != null && lostReasonChange.to !== "" && (
							<p className="w-full text-xs text-muted">
								{t("leads.detail.lostReason")}:{" "}
								<span className="text-text">{String(lostReasonChange.to)}</span>
							</p>
						)}
					</div>
				)}

				{isAssignType && (
					<div className="mt-3 space-y-1 rounded-lg bg-surface px-2.5 py-2 ring-1 ring-inset ring-border">
						{(assigneeChange || metadataAssigneeId != null) && (
							<p className="text-sm text-text">
								<span className="text-muted">
									{t("leads.columns.assignedTo")}:{" "}
								</span>
								{assigneeChange ? (
									<>
										{resolveUserLabel(usersMap, assigneeChange.from) ?? "—"}
										{" → "}
										{resolveUserLabel(usersMap, assigneeChange.to) ??
											resolveUserLabel(usersMap, metadataAssigneeId) ??
											"—"}
									</>
								) : (
									(resolveUserLabel(usersMap, metadataAssigneeId) ?? "—")
								)}
							</p>
						)}
						{metadataReason && (
							<p className="text-xs text-muted">
								{t("pendingLeads.drawer.reason")}:{" "}
								<span className="text-text">{metadataReason}</span>
							</p>
						)}
					</div>
				)}

				{displayChanges.length > 0 && (
					<ul className="mt-3 space-y-1.5">
						{displayChanges.slice(0, 8).map((change) => (
							<li
								key={change.key}
								className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm"
							>
								<span className="text-xs font-medium uppercase tracking-wide text-muted">
									{t(`pendingLeads.diffFields.${change.key}`, {
										defaultValue: change.key.replaceAll("_", " "),
									})}
								</span>
								<span className="text-muted">
									<DiffValue>
										{formatFieldValue(change.key, change.from, usersMap, t)}
									</DiffValue>
									{" → "}
									<DiffValue>
										{formatFieldValue(change.key, change.to, usersMap, t)}
									</DiffValue>
								</span>
							</li>
						))}
						{displayChanges.length > 8 && (
							<li className="text-xs text-muted">
								{t("pendingLeads.drawer.moreChanges", {
									count: displayChanges.length - 8,
								})}
							</li>
						)}
					</ul>
				)}

				{hasSnapshots && (
					<div className="mt-3">
						<button
							type="button"
							onClick={() => setShowRaw((v) => !v)}
							className="inline-flex items-center gap-1 text-xs font-medium text-muted transition hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
						>
							{showRaw ? (
								<ChevronUp className="size-3.5" aria-hidden="true" />
							) : (
								<ChevronDown className="size-3.5" aria-hidden="true" />
							)}
							{showRaw
								? t("pendingLeads.drawer.hideRawSnapshots")
								: t("pendingLeads.drawer.viewRawSnapshots")}
						</button>
						{showRaw && (
							<div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
								<pre className="max-h-40 overflow-auto rounded-lg border border-border bg-surface p-2 text-[11px] leading-relaxed text-text">
									{formatJson(activity.old_value) ??
										t("pendingLeads.drawer.noOldValue")}
								</pre>
								<pre className="max-h-40 overflow-auto rounded-lg border border-border bg-surface p-2 text-[11px] leading-relaxed text-text">
									{formatJson(activity.new_value) ??
										t("pendingLeads.drawer.noNewValue")}
								</pre>
							</div>
						)}
					</div>
				)}
			</div>
		</li>
	);
};

export default PendingLeadActivityItem;

import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatJson } from "../../../auditLogs/utils/auditLogConstants";
import { getAvatarTone, getInitials } from "../../../leads/utils/leadAvatars";
import { getChangedFields } from "../../../pendingLeads/utils/activityDiff";
import {
	formatClientDateTime,
	resolveActivityActor,
} from "../../utils/clientDetailUtils";
import ClientStatusBadge from "../ClientStatusBadge";

function formatFieldValue(key, value, t) {
	if (value == null || value === "") return "—";
	if (key === "status") {
		return <ClientStatusBadge status={value} />;
	}
	if (
		key.endsWith("_at") ||
		key === "created_at" ||
		key === "updated_at" ||
		key === "lost_at" ||
		key === "qualified_at"
	) {
		return formatClientDateTime(value);
	}
	if (typeof value === "object") {
		return formatJson(value) ?? "—";
	}
	return String(value);
}

function DiffValue({ children }) {
	if (typeof children === "string" || typeof children === "number") {
		return <span className="text-sm text-text">{children}</span>;
	}
	return <div className="inline-flex items-center">{children}</div>;
}

const ClientActivityItem = ({ activity, source }) => {
	const { t } = useTranslation();
	const [showRaw, setShowRaw] = useState(false);

	const changes = useMemo(
		() => getChangedFields(activity?.old_value, activity?.new_value),
		[activity?.old_value, activity?.new_value],
	);

	const actorName = resolveActivityActor(activity);
	const typeKey = String(activity?.type ?? "").toLowerCase();
	const typeLabel = t(`clients.drawer.activityTypes.${typeKey}`, {
		defaultValue: typeKey
			? typeKey.replaceAll("_", " ")
			: t("clients.drawer.unknownActivity"),
	});

	const hasSnapshots =
		activity?.old_value != null || activity?.new_value != null;

	const isStatusType =
		typeKey === "client_lost" ||
		typeKey === "client_restored" ||
		typeKey === "status_changed";

	const statusChange = changes.find((c) => c.key === "status");
	const lostReasonChange = changes.find((c) => c.key === "lost_reason");

	const displayChanges = changes.filter((c) => {
		if (isStatusType && (c.key === "status" || c.key === "lost_reason")) {
			return false;
		}
		if (
			isStatusType &&
			(c.key === "lost_by" || c.key === "lost_at")
		) {
			return false;
		}
		return true;
	});

	const sourceKey = source ? String(source).toLowerCase() : null;

	return (
		<li className="relative ps-6">
			<span
				className="absolute start-0 top-2 size-2.5 rounded-full bg-gold ring-4 ring-surface"
				aria-hidden="true"
			/>
			<div className="rounded-xl border border-border bg-background/40 px-3 py-3">
				<div className="flex flex-wrap items-start justify-between gap-2">
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<p className="text-sm font-medium capitalize text-text">
								{typeLabel}
							</p>
							{sourceKey && (
								<span className="inline-flex rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted ring-1 ring-inset ring-border">
									{t(`clients.drawer.timelineSources.${sourceKey}`, {
										defaultValue: sourceKey,
									})}
								</span>
							)}
						</div>
						{activity?.description && (
							<p className="mt-0.5 text-sm text-muted">
								{activity.description}
							</p>
						)}
					</div>
					<time className="shrink-0 text-xs text-muted">
						{formatClientDateTime(
							activity?.occurred_at ?? activity?.created_at,
						)}
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
							{formatFieldValue("status", statusChange.from, t)}
						</DiffValue>
						<span className="text-xs text-muted" aria-hidden="true">
							→
						</span>
						<DiffValue>
							{formatFieldValue("status", statusChange.to, t)}
						</DiffValue>
						{lostReasonChange?.to != null && lostReasonChange.to !== "" && (
							<p className="w-full text-xs text-muted">
								{t("clients.drawer.lostReason")}:{" "}
								<span className="text-text">{String(lostReasonChange.to)}</span>
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
									{t(`clients.drawer.diffFields.${change.key}`, {
										defaultValue: change.key.replaceAll("_", " "),
									})}
								</span>
								<span className="text-muted">
									<DiffValue>
										{formatFieldValue(change.key, change.from, t)}
									</DiffValue>
									{" → "}
									<DiffValue>
										{formatFieldValue(change.key, change.to, t)}
									</DiffValue>
								</span>
							</li>
						))}
						{displayChanges.length > 8 && (
							<li className="text-xs text-muted">
								{t("clients.drawer.moreChanges", {
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
								? t("clients.drawer.hideRawSnapshots")
								: t("clients.drawer.viewRawSnapshots")}
						</button>
						{showRaw && (
							<div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
								<pre className="max-h-40 overflow-auto rounded-lg border border-border bg-surface p-2 text-[11px] leading-relaxed text-text">
									{formatJson(activity.old_value) ??
										t("clients.drawer.noOldValue")}
								</pre>
								<pre className="max-h-40 overflow-auto rounded-lg border border-border bg-surface p-2 text-[11px] leading-relaxed text-text">
									{formatJson(activity.new_value) ??
										t("clients.drawer.noNewValue")}
								</pre>
							</div>
						)}
					</div>
				)}
			</div>
		</li>
	);
};

export default ClientActivityItem;

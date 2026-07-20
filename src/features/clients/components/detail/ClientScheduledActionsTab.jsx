import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SCHEDULED_ACTION_STATUS_STYLES } from "../../../scheduledActions/utils/scheduledActionConstants";
import { nestedEntityName } from "../../../../utils/api/nestedRelations";
import {
	formatClientDateTime,
	resolveUserName,
	sortByOccurredAtDesc,
} from "../../utils/clientDetailUtils";

function EmptyState({ title, message }) {
	return (
		<div className="px-4 py-10 text-center">
			<p className="text-sm font-medium text-text">{title}</p>
			<p className="mt-1 text-sm text-muted">{message}</p>
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

const ClientScheduledActionsTab = ({ scheduledActions = [], users = [] }) => {
	const { t } = useTranslation();

	const sorted = useMemo(
		() => sortByOccurredAtDesc(scheduledActions, "scheduled_at"),
		[scheduledActions],
	);

	if (sorted.length === 0) {
		return (
			<EmptyState
				title={t("clients.drawer.scheduledActionsEmptyTitle")}
				message={t("clients.drawer.scheduledActionsEmptyMessage")}
			/>
		);
	}

	return (
		<ul className="space-y-3">
			{sorted.map((action) => {
				const assigneeName =
					action.assignee != null
						? nestedEntityName(action.assignee)
						: resolveUserName(users, action.assigned_to);

				return (
				<li
					key={action.id}
					className="rounded-xl border border-border bg-background/40 px-3 py-3"
				>
					<div className="flex flex-wrap items-start justify-between gap-2">
						<div className="min-w-0">
							<p className="text-sm font-medium text-text">
								{t(`scheduledActions.types.${action.type}`, {
									defaultValue: action.type,
								})}
							</p>
							{action.note && (
								<p className="mt-1 text-sm text-muted">{action.note}</p>
							)}
						</div>
						<StatusBadge status={action.status} t={t} />
					</div>
					<div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
						{assigneeName && (
							<span>
								{t("clients.drawer.assignee")}:{" "}
								<span className="text-text">{assigneeName}</span>
							</span>
						)}
						<span>
							{t("clients.drawer.scheduledAt")}:{" "}
							{formatClientDateTime(action.scheduled_at)}
						</span>
						{action.completed_at && (
							<span>
								{t("clients.drawer.completedAt")}:{" "}
								{formatClientDateTime(action.completed_at)}
							</span>
						)}
						{action.outcome && (
							<span>
								{t("clients.drawer.outcome")}:{" "}
								<span className="text-text">{action.outcome}</span>
							</span>
						)}
					</div>
				</li>
				);
			})}
		</ul>
	);
};

export default ClientScheduledActionsTab;

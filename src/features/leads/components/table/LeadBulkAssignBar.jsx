import { useTranslation } from "react-i18next";
import LeadAssignSelect from "./LeadAssignSelect";
import LeadStatusSelect from "./LeadStatusSelect";

const LeadBulkAssignBar = ({
	selectedCount,
	users = [],
	isAssigning = false,
	isUpdatingStatus = false,
	isDeleting = false,
	onAssign,
	onStatusChange,
	onDelete,
	onClear,
	canDelete = true,
}) => {
	const { t } = useTranslation();
	const busy = isAssigning || isUpdatingStatus || isDeleting;

	if (selectedCount < 1) return null;

	return (
		<div className="pointer-events-none fixed inset-x-0 top-20 z-[100] flex justify-center px-4">
			<div className="pointer-events-auto flex w-full max-w-4xl flex-col gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-xl sm:flex-row sm:items-center sm:justify-between">
				<p className="text-sm font-medium text-text">
					{t("leads.bulk.selected", { count: selectedCount })}
				</p>
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-sm text-muted">
						{t("leads.columns.status")}
					</span>
					<LeadStatusSelect
						status=""
						onChange={onStatusChange}
						isUpdating={isUpdatingStatus}
						disabled={busy}
						placement="bottom"
					/>
					<span className="text-sm text-muted">
						{t("dashboard.quickActions.assignLead")}
					</span>
					<LeadAssignSelect
						assignedTo=""
						users={users}
						onChange={onAssign}
						isUpdating={isAssigning}
						disabled={busy}
						placement="bottom"
					/>
					{canDelete && (
						<button
							type="button"
							onClick={onDelete}
							disabled={busy}
							className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
						>
							{isDeleting ? t("common.loading") : t("leads.bulk.delete")}
						</button>
					)}
					<button
						type="button"
						onClick={onClear}
						disabled={busy}
						className="rounded-xl border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text transition hover:bg-background disabled:opacity-60"
					>
						{t("leads.bulk.clearSelection")}
					</button>
				</div>
			</div>
		</div>
	);
};

export default LeadBulkAssignBar;

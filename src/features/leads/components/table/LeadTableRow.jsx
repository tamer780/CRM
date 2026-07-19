import { useTranslation } from "react-i18next";
import { LEAD_STATUS_ROW_STYLES } from "../../../../utils/leads/leadConstants";
import { resolveProjectLabel } from "../../../../utils/leads/resolveLeadLabels";
import { getAvatarTone, getInitials } from "../../utils/leadAvatars";
import LeadActionsMenu from "./LeadActionsMenu";
import LeadAssignSelect from "./LeadAssignSelect";
import LeadStatusSelect from "./LeadStatusSelect";
import ScheduledCallBadge from "./ScheduledCallBadge";

function rowStatusClass(status) {
	return (
		LEAD_STATUS_ROW_STYLES[status] ??
		"bg-background/40 border-s-4 border-s-border hover:bg-background/70"
	);
}

function formatDate(value) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function getLastCommentText(lastComment) {
	if (!lastComment) return "";
	if (typeof lastComment === "string") return lastComment;

	const body =
		lastComment.comment ??
		lastComment.body ??
		lastComment.text ??
		lastComment.note ??
		lastComment.message ??
		"";
	if (!body) return "";

	const author =
		lastComment.user?.name ??
		lastComment.author?.name ??
		lastComment.user_name ??
		lastComment.author_name ??
		null;

	return author ? `${author}: ${body}` : body;
}

const checkboxClass =
	"size-4 rounded border-border text-gold accent-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30";

export function LeadMobileCard({
	lead,
	users = [],
	onView,
	onEdit,
	onStatusChange,
	onAssignChange,
	statusUpdatingId,
	assignUpdatingId,
	selected = false,
	onToggleSelect,
	canEdit = true,
}) {
	const { t } = useTranslation();
	const showActions = canEdit;
	const lastCommentText = getLastCommentText(lead.last_comment);

	return (
		<article
			className={`border-b border-border px-4 py-4 transition-colors last:border-b-0 ${rowStatusClass(lead.status)}`}
		>
			<div className="flex items-start gap-3">
				<div
					className="pt-1"
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(e) => e.stopPropagation()}
				>
					<input
						type="checkbox"
						checked={selected}
						onChange={() => onToggleSelect?.(lead.id)}
						aria-label={t("leads.bulk.selectLead", {
							name: lead.name ?? lead.id,
						})}
						className={checkboxClass}
					/>
				</div>
				<div
					className="flex min-w-0 flex-1 cursor-pointer items-start gap-3"
					onClick={() => onView(lead)}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							onView(lead);
						}
					}}
					role="button"
					tabIndex={0}
				>
					<span
						className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarTone(lead.name)}`}
					>
						{getInitials(lead.name)}
					</span>
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-2">
							<p
								className="max-w-[12rem] truncate font-medium text-text"
								title={lead.name ?? undefined}
							>
								{lead.name ?? "—"}
							</p>
							<div
								onClick={(e) => e.stopPropagation()}
								onKeyDown={(e) => e.stopPropagation()}
							>
								<LeadStatusSelect
									status={lead.status}
									onChange={(status) => onStatusChange?.(lead, status)}
									isUpdating={statusUpdatingId === lead.id}
								/>
							</div>
						</div>
						<div className="mt-2">
							<ScheduledCallBadge scheduledCallAt={lead.scheduled_call_at} />
						</div>
						<div
							className="mt-2"
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
						>
							<LeadAssignSelect
								assignedTo={lead.assigned_to}
								users={users}
								onChange={(userId) => onAssignChange?.(lead, userId)}
								isUpdating={assignUpdatingId === lead.id}
								placement="top"
							/>
						</div>
						<p className="mt-1 text-xs text-muted" dir="ltr">
							{lead.phone ?? "—"}
							{lead.email ? ` · ${lead.email}` : ""}
						</p>
						{lead.note ? (
							<p
								className="mt-1 truncate text-xs text-muted"
								title={lead.note}
							>
								{lead.note}
							</p>
						) : null}
						{lastCommentText ? (
							<p
								className="mt-1 truncate text-xs text-muted"
								title={lastCommentText}
							>
								{lastCommentText}
							</p>
						) : null}
						<p className="mt-1 text-xs text-muted">
							{formatDate(lead.created_at)}
						</p>
					</div>
				</div>
			</div>
			{showActions && (
				<div className="mt-3 flex justify-end border-t border-border/60 pt-3">
					<LeadActionsMenu onEdit={() => onEdit(lead)} canEdit={canEdit} />
				</div>
			)}
		</article>
	);
}

const LeadTableRow = ({
	lead,
	projectsMap,
	users = [],
	onView,
	onEdit,
	onStatusChange,
	onAssignChange,
	statusUpdatingId,
	assignUpdatingId,
	selected = false,
	onToggleSelect,
	canEdit = true,
}) => {
	const { t } = useTranslation();
	const showActions = canEdit;
	const projectLabel = resolveProjectLabel(projectsMap, lead);
	const lastCommentText = getLastCommentText(lead.last_comment);

	return (
		<tr
			role="button"
			tabIndex={0}
			onClick={() => onView(lead)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onView(lead);
				}
			}}
			className={`cursor-pointer transition-colors duration-150 ${rowStatusClass(lead.status)}`}
		>
			<td
				className="px-4 py-3"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<input
					type="checkbox"
					checked={selected}
					onChange={() => onToggleSelect?.(lead.id)}
					aria-label={t("leads.bulk.selectLead", {
						name: lead.name ?? lead.id,
					})}
					className={checkboxClass}
				/>
			</td>
			<td className="max-w-[14rem] px-4 py-3">
				<div className="flex items-center gap-3">
					<span
						className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarTone(lead.name)}`}
					>
						{getInitials(lead.name)}
					</span>
					<div className="min-w-0">
						<p
							className="truncate font-medium text-text"
							title={lead.name ?? undefined}
						>
							{lead.name ?? "—"}
						</p>
						<p className="truncate text-xs text-muted" dir="ltr">
							{lead.phone ?? "—"}
						</p>
						{lead.email && (
							<p
								className="truncate text-xs text-muted"
								dir="ltr"
								title={lead.email}
							>
								{lead.email}
							</p>
						)}
					</div>
				</div>
			</td>
			<td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
				<LeadStatusSelect
					status={lead.status}
					onChange={(status) => onStatusChange?.(lead, status)}
					isUpdating={statusUpdatingId === lead.id}
				/>
			</td>
			<td className="px-4 py-3">
				<ScheduledCallBadge scheduledCallAt={lead.scheduled_call_at} />
			</td>
			<td className="max-w-[5rem] px-4 py-3 text-muted">
				<span className="block truncate" title={projectLabel}>
					{projectLabel}
				</span>
			</td>
			<td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
				<LeadAssignSelect
					assignedTo={lead.assigned_to}
					users={users}
					onChange={(userId) => onAssignChange?.(lead, userId)}
					isUpdating={assignUpdatingId === lead.id}
					placement="top"
				/>
			</td>
			<td className="max-w-[12rem] px-4 py-3 text-muted">
				<span className="block truncate" title={lead.note || undefined}>
					{lead.note || "—"}
				</span>
			</td>
			<td className="max-w-[12rem] px-4 py-3 text-muted">
				<span
					className="block truncate"
					title={lastCommentText || undefined}
				>
					{lastCommentText || "—"}
				</span>
			</td>
			<td className="px-4 py-3 text-muted">{formatDate(lead.created_at)}</td>
			{showActions && (
				<td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
					<LeadActionsMenu onEdit={() => onEdit(lead)} canEdit={canEdit} />
				</td>
			)}
		</tr>
	);
};

export default LeadTableRow;

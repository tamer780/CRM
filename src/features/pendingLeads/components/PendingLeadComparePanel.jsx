import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import SourceBadge from "../../../components/ui/SourceBadge";
import LeadStatusBadge from "../../leads/components/table/LeadStatusBadge";
import { nestedEntityName } from "../../../utils/api/nestedRelations";

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

function normalizeComparable(value) {
	if (value == null || value === "") return "";
	return String(value).trim().toLowerCase();
}

function valuesDiffer(a, b) {
	return normalizeComparable(a) !== normalizeComparable(b);
}

function resolveProjectName(row, projectsMap) {
	const nested = nestedEntityName(row?.project);
	if (nested !== "—") return nested;
	const id = row?.project_id;
	if (id == null) return "—";
	const entity =
		projectsMap?.get(Number(id)) ?? projectsMap?.get(String(id));
	return entity?.name ?? `#${id}`;
}

function resolveCampaignName(row, campaignsMap) {
	const nested = nestedEntityName(row?.campaign);
	if (nested !== "—") return nested;
	const id = row?.campaign_id;
	if (id == null) return "—";
	const entity =
		campaignsMap?.get(Number(id)) ?? campaignsMap?.get(String(id));
	return entity?.name ?? `#${id}`;
}

function resolveAssigneeName(row, usersMap) {
	const nested = nestedEntityName(row?.assignee);
	if (nested !== "—") return nested;
	const id = row?.assigned_to;
	if (id == null) return "—";
	const user = usersMap?.get(Number(id)) ?? usersMap?.get(String(id));
	return user?.name ?? user?.email ?? `#${id}`;
}

function renderCellValue(row, side) {
	if (row.type === "source") {
		const source = side === "old" ? row.oldSource : row.newSource;
		return source ? (
			<SourceBadge source={source} />
		) : (
			<span className="text-sm text-muted">—</span>
		);
	}

	if (row.type === "status") {
		const status = side === "old" ? row.oldStatus : row.newStatus;
		return status ? (
			<LeadStatusBadge status={status} />
		) : (
			<span className="text-sm text-muted">—</span>
		);
	}

	const value = side === "old" ? row.oldValue : row.newValue;
	return (
		<span className="text-sm text-text" dir={row.dir}>
			{value == null || value === "" ? "—" : value}
		</span>
	);
}

function FieldValueTable({ title, subtitle, recordName, rows, side, className }) {
	return (
		<div
			className={[
				"flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-background/40",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			<div className="sticky top-0 z-1 border-b border-border bg-surface px-4 py-3">
				<p className="text-xs font-semibold uppercase tracking-wide text-muted">
					{title}
				</p>
				<p className="mt-0.5 text-[11px] text-muted">{subtitle}</p>
				<p className="mt-1 truncate text-sm font-medium text-text">
					{recordName ?? "—"}
				</p>
			</div>

			<div className="min-h-0 flex-1 overflow-x-auto">
				<table className="w-full min-w-[220px] border-collapse text-sm">
					<tbody>
						{rows.map((row) => (
							<tr
								key={row.key}
								className={[
									"border-b border-border/70 last:border-b-0",
									row.differ
										? "bg-amber-50/80 ring-1 ring-inset ring-amber-200/70"
										: "",
								]
									.filter(Boolean)
									.join(" ")}
							>
								<th
									scope="row"
									className="w-[38%] px-4 py-2.5 text-start align-top text-[11px] font-medium uppercase tracking-wide text-muted"
								>
									{row.label}
								</th>
								<td className="px-4 py-2.5 align-top">{renderCellValue(row, side)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

/**
 * Side-by-side Old vs New tables for pending lead vs existing lead/client.
 */
const PendingLeadComparePanel = ({
	lead,
	projectsMap,
	campaignsMap,
	usersMap,
}) => {
	const { t } = useTranslation();

	const existingLead = lead?.existing_lead ?? null;
	const existingClient = lead?.existing_client ?? null;
	const match = existingLead ?? existingClient;
	const matchKind = existingLead
		? "lead"
		: existingClient
			? "client"
			: null;

	const rows = useMemo(() => {
		if (!lead) return [];

		const oldProject = resolveProjectName(match, projectsMap);
		const newProject = resolveProjectName(lead, projectsMap);
		const oldCampaign = resolveCampaignName(match, campaignsMap);
		const newCampaign = resolveCampaignName(lead, campaignsMap);
		const oldAssignee = resolveAssigneeName(match, usersMap);
		const newAssignee = resolveAssigneeName(lead, usersMap);
		const existingNote =
			match?.note || match?.last_communication_note || null;

		const fieldRows = [
			{
				key: "name",
				label: t("leads.form.name"),
				oldValue: match?.name,
				newValue: lead.name,
				differ: match ? valuesDiffer(lead.name, match?.name) : false,
			},
			{
				key: "phone",
				label: t("leads.form.phone"),
				oldValue: match?.phone,
				newValue: lead.phone,
				differ: match ? valuesDiffer(lead.phone, match?.phone) : false,
				dir: "ltr",
			},
			{
				key: "email",
				label: t("leads.form.email"),
				oldValue: match?.email,
				newValue: lead.email,
				differ: match ? valuesDiffer(lead.email, match?.email) : false,
				dir: "ltr",
			},
			{
				key: "source",
				label: t("leads.form.source"),
				type: "source",
				oldSource: match?.source,
				newSource: lead.source,
				differ: match ? valuesDiffer(lead.source, match?.source) : false,
			},
			{
				key: "source_details",
				label: t("pendingLeads.drawer.sourceDetails"),
				oldValue: match?.source_details,
				newValue: lead.source_details,
				differ: match
					? valuesDiffer(lead.source_details, match?.source_details)
					: false,
			},
			{
				key: "project",
				label: t("leads.form.project"),
				oldValue: oldProject,
				newValue: newProject,
				differ: match ? valuesDiffer(newProject, oldProject) : false,
			},
			{
				key: "campaign",
				label: t("leads.form.campaign"),
				oldValue: oldCampaign,
				newValue: newCampaign,
				differ: match ? valuesDiffer(newCampaign, oldCampaign) : false,
			},
			{
				key: "assignee",
				label: t("leads.columns.assignedTo"),
				oldValue: oldAssignee,
				newValue: newAssignee,
				differ: match ? valuesDiffer(newAssignee, oldAssignee) : false,
			},
			{
				key: "scheduled_call_at",
				label: t("pendingLeads.diffFields.scheduled_call_at"),
				oldValue: formatDateTime(match?.scheduled_call_at),
				newValue: formatDateTime(lead.scheduled_call_at),
				differ: match
					? valuesDiffer(
							lead.scheduled_call_at,
							match?.scheduled_call_at,
						)
					: false,
			},
			{
				key: "status",
				label: t("leads.columns.status"),
				type: "status",
				oldStatus: match?.status ?? null,
				newStatus: null,
				differ: false,
			},
			{
				key: "note",
				label: t("pendingLeads.drawer.notes"),
				oldValue: existingNote,
				newValue: lead.note,
				differ: match ? valuesDiffer(lead.note, existingNote) : false,
			},
			{
				key: "created",
				label: t("pendingLeads.drawer.createdAt"),
				oldValue: match ? formatDateTime(match.created_at) : null,
				newValue: formatDateTime(lead.created_at),
				differ: false,
			},
		];

		return fieldRows;
	}, [lead, match, projectsMap, campaignsMap, usersMap, t]);

	const oldSubtitle =
		matchKind === "client"
			? t("pendingLeads.drawer.existingClientPanel")
			: t("pendingLeads.drawer.existingLeadPanel");

	return (
		<section className="space-y-3">
			<div className="flex flex-wrap items-end justify-between gap-2">
				<h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
					{t("pendingLeads.drawer.compare")}
				</h3>
				{match?.id != null && (
					<p className="text-xs text-muted">
						{matchKind === "client"
							? t("pendingLeads.drawer.existingClientId")
							: t("pendingLeads.drawer.existingLeadId")}
						{": "}
						<span className="font-medium text-text">#{match.id}</span>
					</p>
				)}
			</div>

			{!match ? (
				<div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center">
					<p className="text-sm font-medium text-text">
						{t("pendingLeads.drawer.noMatchTitle")}
					</p>
					<p className="mt-1 text-sm text-muted">
						{t("pendingLeads.drawer.noMatchMessage")}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
					<FieldValueTable
						title={t("pendingLeads.drawer.newPanel")}
						subtitle={t("pendingLeads.drawer.pendingPanel")}
						recordName={lead?.name}
						rows={rows}
						side="new"
						className="order-1 sm:order-2"
					/>
					<FieldValueTable
						title={t("pendingLeads.drawer.oldPanel")}
						subtitle={oldSubtitle}
						recordName={match?.name}
						rows={rows}
						side="old"
						className="order-2 sm:order-1"
					/>
				</div>
			)}
		</section>
	);
};

export default PendingLeadComparePanel;

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import SourceBadge from "../../../components/ui/SourceBadge";
import LeadStatusBadge from "../../leads/components/table/LeadStatusBadge";

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

function resolveUserLabel(usersMap, id, fallbackName) {
	if (fallbackName) return fallbackName;
	if (id == null || id === "") return null;
	const user = usersMap?.get(Number(id)) ?? usersMap?.get(String(id));
	if (!user) return id != null ? String(id) : null;
	return user.name ?? user.email ?? String(id);
}

function resolveEntityLabel(map, id, nested) {
	if (nested?.name) return nested.name;
	if (id == null || id === "") return null;
	const item = map?.get(Number(id)) ?? map?.get(String(id));
	if (!item) return id != null ? String(id) : null;
	return item.name ?? item.title ?? String(id);
}

function normalizeComparable(value) {
	if (value == null || value === "") return "";
	return String(value).trim().toLowerCase();
}

function valuesDiffer(a, b) {
	return normalizeComparable(a) !== normalizeComparable(b);
}

function CompareRow({
	label,
	left,
	right,
	differ,
	dir,
	leftCaption,
	rightCaption,
}) {
	return (
		<div
			className={[
				"rounded-xl px-3 py-2.5",
				differ ? "bg-amber-50/80 ring-1 ring-inset ring-amber-200/70" : "",
			]
				.filter(Boolean)
				.join(" ")}
		>
			<p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">
				{label}
			</p>
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
				<div className="min-w-0">
					<p className="text-[10px] font-medium uppercase tracking-wide text-muted sm:hidden">
						{leftCaption}
					</p>
					<p className="mt-0.5 text-sm text-text" dir={dir}>
						{left == null || left === "" ? "—" : left}
					</p>
				</div>
				<div className="min-w-0">
					<p className="text-[10px] font-medium uppercase tracking-wide text-muted sm:hidden">
						{rightCaption}
					</p>
					<p className="mt-0.5 text-sm text-text" dir={dir}>
						{right == null || right === "" ? "—" : right}
					</p>
				</div>
			</div>
		</div>
	);
}

function CompareRowCustom({
	label,
	left,
	right,
	differ,
	leftCaption,
	rightCaption,
}) {
	return (
		<div
			className={[
				"rounded-xl px-3 py-2.5",
				differ ? "bg-amber-50/80 ring-1 ring-inset ring-amber-200/70" : "",
			]
				.filter(Boolean)
				.join(" ")}
		>
			<p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">
				{label}
			</p>
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
				<div className="min-w-0">
					<p className="text-[10px] font-medium uppercase tracking-wide text-muted sm:hidden">
						{leftCaption}
					</p>
					<div className="mt-0.5">{left}</div>
				</div>
				<div className="min-w-0">
					<p className="text-[10px] font-medium uppercase tracking-wide text-muted sm:hidden">
						{rightCaption}
					</p>
					<div className="mt-0.5">{right}</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Side-by-side comparison of pending lead vs existing lead/client.
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

	const pendingProject = resolveEntityLabel(
		projectsMap,
		lead?.project_id,
		null,
	);
	const existingProject = resolveEntityLabel(
		projectsMap,
		match?.project_id,
		match?.project,
	);
	const pendingCampaign = resolveEntityLabel(
		campaignsMap,
		lead?.campaign_id,
		null,
	);
	const existingCampaign = resolveEntityLabel(
		campaignsMap,
		match?.campaign_id,
		match?.campaign,
	);
	const pendingAssignee = resolveUserLabel(usersMap, lead?.assigned_to);
	const existingAssignee = resolveUserLabel(
		usersMap,
		match?.assigned_to,
		match?.assignee?.name,
	);

	const rows = useMemo(() => {
		if (!lead) return [];

		const existingNote =
			match?.note ||
			match?.last_communication_note ||
			null;

		return [
			{
				key: "name",
				label: t("leads.form.name"),
				left: lead.name,
				right: match?.name,
				differ: match ? valuesDiffer(lead.name, match?.name) : false,
			},
			{
				key: "phone",
				label: t("leads.form.phone"),
				left: lead.phone,
				right: match?.phone,
				differ: false,
				dir: "ltr",
			},
			{
				key: "email",
				label: t("leads.form.email"),
				left: lead.email,
				right: match?.email,
				differ: match ? valuesDiffer(lead.email, match?.email) : false,
				dir: "ltr",
			},
			{
				key: "source",
				label: t("leads.form.source"),
				type: "source",
				leftSource: lead.source,
				rightSource: match?.source,
				differ: match ? valuesDiffer(lead.source, match?.source) : false,
			},
			{
				key: "source_details",
				label: t("pendingLeads.drawer.sourceDetails"),
				left: lead.source_details,
				right: match?.source_details,
				differ: match
					? valuesDiffer(lead.source_details, match?.source_details)
					: false,
			},
			{
				key: "project",
				label: t("leads.form.project"),
				left: pendingProject,
				right: existingProject,
				differ: match
					? valuesDiffer(pendingProject, existingProject)
					: false,
			},
			{
				key: "campaign",
				label: t("leads.form.campaign"),
				left: pendingCampaign,
				right: existingCampaign,
				differ: match
					? valuesDiffer(pendingCampaign, existingCampaign)
					: false,
			},
			{
				key: "assignee",
				label: t("leads.columns.assignedTo"),
				left: pendingAssignee,
				right: existingAssignee,
				differ: match
					? valuesDiffer(pendingAssignee, existingAssignee)
					: false,
			},
			{
				key: "status",
				label: t("leads.columns.status"),
				type: "status",
				leftStatus: null,
				rightStatus: match?.status ?? null,
				differ: false,
			},
			{
				key: "note",
				label: t("pendingLeads.drawer.notes"),
				left: lead.note,
				right: existingNote,
				differ: match ? valuesDiffer(lead.note, existingNote) : false,
			},
			{
				key: "created",
				label: t("pendingLeads.drawer.createdAt"),
				left: formatDateTime(lead.created_at),
				right: match ? formatDateTime(match.created_at) : null,
				differ: false,
			},
		];
	}, [
		lead,
		match,
		pendingProject,
		existingProject,
		pendingCampaign,
		existingCampaign,
		pendingAssignee,
		existingAssignee,
		t,
	]);

	const rightTitle =
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
				<div className="overflow-hidden rounded-2xl border border-border bg-background/40">
					<div className="hidden grid-cols-2 gap-4 border-b border-border bg-surface px-3 py-3 sm:grid sm:px-4">
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-muted">
								{t("pendingLeads.drawer.pendingPanel")}
							</p>
							<p className="mt-0.5 truncate text-sm font-medium text-text">
								{lead?.name ?? "—"}
							</p>
						</div>
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-muted">
								{rightTitle}
							</p>
							<p className="mt-0.5 truncate text-sm font-medium text-text">
								{match?.name ?? "—"}
							</p>
						</div>
					</div>

					<div className="space-y-1 p-2 sm:p-3">
						{rows.map((row) => {
							const leftCaption = t("pendingLeads.drawer.pendingPanel");
							const rightCaption = rightTitle;

							if (row.type === "source") {
								return (
									<CompareRowCustom
										key={row.key}
										label={row.label}
										differ={row.differ}
										leftCaption={leftCaption}
										rightCaption={rightCaption}
										left={<SourceBadge source={row.leftSource} />}
										right={<SourceBadge source={row.rightSource} />}
									/>
								);
							}
							if (row.type === "status") {
								return (
									<CompareRowCustom
										key={row.key}
										label={row.label}
										differ={false}
										leftCaption={leftCaption}
										rightCaption={rightCaption}
										left={<span className="text-sm text-muted">—</span>}
										right={
											row.rightStatus ? (
												<LeadStatusBadge status={row.rightStatus} />
											) : (
												<span className="text-sm text-muted">—</span>
											)
										}
									/>
								);
							}
							return (
								<CompareRow
									key={row.key}
									label={row.label}
									left={row.left}
									right={row.right}
									differ={row.differ}
									dir={row.dir}
									leftCaption={leftCaption}
									rightCaption={rightCaption}
								/>
							);
						})}
					</div>
				</div>
			)}
		</section>
	);
};

export default PendingLeadComparePanel;

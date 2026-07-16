function csvEscape(value) {
	const str = value == null ? "" : String(value);
	if (/[",\n\r]/.test(str)) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

function resolveName(map, id) {
	if (id == null || id === "") return "";
	const item = map?.get?.(Number(id)) ?? map?.get?.(String(id));
	if (!item) return String(id);
	return item.name ?? item.title ?? String(id);
}

/**
 * Client-side CSV export of filtered leads. No network request.
 */
export function exportLeadsCsv(leads, { projectsMap, campaignsMap, usersMap, filename } = {}) {
	const headers = [
		"Name",
		"Phone",
		"Email",
		"Source",
		"Status",
		"Project",
		"Campaign",
		"Assigned To",
		"Created At",
	];

	const rows = (leads ?? []).map((lead) => [
		lead.name ?? "",
		lead.phone ?? "",
		lead.email ?? "",
		lead.source ?? "",
		lead.status ?? "",
		resolveName(projectsMap, lead.project_id),
		resolveName(campaignsMap, lead.campaign_id),
		resolveName(usersMap, lead.assigned_to),
		lead.created_at ?? "",
	]);

	const lines = [headers, ...rows].map((row) => row.map(csvEscape).join(","));
	const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename ?? `leads-${new Date().toISOString().slice(0, 10)}.csv`;
	link.click();
	URL.revokeObjectURL(url);
}

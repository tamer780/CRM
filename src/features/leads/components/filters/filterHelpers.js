/** Non-search filter keys used for badge count and chips. */
export const FILTER_KEYS = [
	"status",
	"source",
	"projectId",
	"campaignId",
	"assignedTo",
	"dateFrom",
	"dateTo",
];

export const emptyDraftFilters = () => ({
	status: ["default"],
	source: "",
	projectId: "",
	campaignId: "",
	assignedTo: "",
	dateFrom: "",
	dateTo: "",
});

function normalizeStatusFilter(status) {
	if (Array.isArray(status)) {
		const next = status.map(String).filter(Boolean);
		return next.length > 0 ? next : ["default"];
	}
	if (status == null || status === "") return ["default"];
	return [String(status)];
}

export function pickDraftFromFilters(filters) {
	return {
		status: normalizeStatusFilter(filters.status),
		source: filters.source ?? "",
		projectId: filters.projectId ?? "",
		campaignId: filters.campaignId ?? "",
		assignedTo: filters.assignedTo ?? "",
		dateFrom: filters.dateFrom ?? "",
		dateTo: filters.dateTo ?? "",
	};
}

export function countActiveFilters(filters) {
	let count = 0;
	const statuses = normalizeStatusFilter(filters.status);
	const isDefaultOnly =
		statuses.length === 1 && statuses[0] === "default";
	if (statuses.length > 0 && !isDefaultOnly) count += 1;
	if (filters.source) count += 1;
	if (filters.projectId) count += 1;
	if (filters.campaignId) count += 1;
	if (filters.assignedTo) count += 1;
	if (filters.dateFrom || filters.dateTo) count += 1;
	return count;
}

function resolveOptionLabel(options, value) {
	const match = options.find((o) => String(o.value) === String(value));
	return match?.label ?? String(value);
}

/**
 * Build chip descriptors for ActiveFilters.
 * @returns {{ id: string, label: string, clear: Record<string, unknown> }[]}
 */
export function buildActiveFilterChips(
	filters,
	{ t, statusOpts, sourceOpts, projectOpts, campaignOpts, userOpts },
) {
	const chips = [];
	const statuses = normalizeStatusFilter(filters.status);
	const isDefaultOnly =
		statuses.length === 1 && statuses[0] === "default";

	if (!isDefaultOnly && statuses.length === 1) {
		chips.push({
			id: "status",
			label: `${t("leads.columns.status")}: ${resolveOptionLabel(statusOpts, statuses[0])}`,
			clear: { status: ["default"] },
		});
	} else if (statuses.length > 1) {
		chips.push({
			id: "status",
			label: `${t("leads.columns.status")}: ${t("leads.filters.statusSelected", { count: statuses.length })}`,
			clear: { status: ["default"] },
		});
	}
	if (filters.source) {
		chips.push({
			id: "source",
			label: `${t("leads.form.source")}: ${resolveOptionLabel(sourceOpts, filters.source)}`,
			clear: { source: "" },
		});
	}
	if (filters.projectId) {
		chips.push({
			id: "projectId",
			label: `${t("leads.form.project")}: ${resolveOptionLabel(projectOpts, filters.projectId)}`,
			clear: { projectId: "" },
		});
	}
	if (filters.campaignId) {
		chips.push({
			id: "campaignId",
			label: `${t("leads.form.campaign")}: ${resolveOptionLabel(campaignOpts, filters.campaignId)}`,
			clear: { campaignId: "" },
		});
	}
	if (filters.assignedTo) {
		chips.push({
			id: "assignedTo",
			label: `${t("leads.columns.assignedTo")}: ${resolveOptionLabel(userOpts, filters.assignedTo)}`,
			clear: { assignedTo: "" },
		});
	}
	if (filters.dateFrom || filters.dateTo) {
		const from = filters.dateFrom || "…";
		const to = filters.dateTo || "…";
		chips.push({
			id: "dateRange",
			label: `${t("leads.columns.created")}: ${from} – ${to}`,
			clear: { dateFrom: "", dateTo: "" },
		});
	}

	return chips;
}

export function clearAllAppliedFilters(filters) {
	return {
		...filters,
		...emptyDraftFilters(),
	};
}

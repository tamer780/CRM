/** Non-search filter keys used for badge count and chips. */
export const FILTER_KEYS = [
	"status",
	"source",
	"projectId",
	"campaignId",
	"assignedTo",
	"assignedAtFrom",
	"assignedAtTo",
	"createdFrom",
	"createdTo",
	"lastActionFrom",
	"lastActionTo",
];

export const emptyDraftFilters = () => ({
	status: ["default"],
	source: "",
	projectId: "",
	campaignId: "",
	assignedTo: [],
	assignedAtFrom: "",
	assignedAtTo: "",
	createdFrom: "",
	createdTo: "",
	lastActionFrom: "",
	lastActionTo: "",
});

function normalizeStatusFilter(status) {
	if (Array.isArray(status)) {
		const next = status.map(String).filter(Boolean);
		return next.length > 0 ? next : ["default"];
	}
	if (status == null || status === "") return ["default"];
	return [String(status)];
}

function normalizeAssignedToFilter(assignedTo) {
	if (Array.isArray(assignedTo)) {
		return assignedTo.map(String).filter(Boolean);
	}
	if (assignedTo == null || assignedTo === "") return [];
	return [String(assignedTo)];
}

export function pickDraftFromFilters(filters) {
	return {
		status: normalizeStatusFilter(filters.status),
		source: filters.source ?? "",
		projectId: filters.projectId ?? "",
		campaignId: filters.campaignId ?? "",
		assignedTo: normalizeAssignedToFilter(filters.assignedTo),
		assignedAtFrom: filters.assignedAtFrom ?? "",
		assignedAtTo: filters.assignedAtTo ?? "",
		createdFrom: filters.createdFrom ?? "",
		createdTo: filters.createdTo ?? "",
		lastActionFrom: filters.lastActionFrom ?? "",
		lastActionTo: filters.lastActionTo ?? "",
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
	const assigned = normalizeAssignedToFilter(filters.assignedTo);
	if (assigned.length > 0) count += 1;
	if (filters.assignedAtFrom || filters.assignedAtTo) count += 1;
	if (filters.createdFrom || filters.createdTo) count += 1;
	if (filters.lastActionFrom || filters.lastActionTo) count += 1;
	return count;
}

function resolveOptionLabel(options, value) {
	const match = options.find((o) => String(o.value) === String(value));
	return match?.label ?? String(value);
}

function dateRangeChip(id, labelKey, from, to, clear, t) {
	if (!from && !to) return null;
	const fromLabel = from || "…";
	const toLabel = to || "…";
	return {
		id,
		label: `${t(labelKey)}: ${fromLabel} – ${toLabel}`,
		clear,
	};
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

	const assigned = normalizeAssignedToFilter(filters.assignedTo);
	if (assigned.length === 1) {
		chips.push({
			id: "assignedTo",
			label: `${t("leads.columns.assignedTo")}: ${resolveOptionLabel(userOpts, assigned[0])}`,
			clear: { assignedTo: [] },
		});
	} else if (assigned.length > 1) {
		chips.push({
			id: "assignedTo",
			label: `${t("leads.columns.assignedTo")}: ${t("leads.filters.usersSelected", { count: assigned.length })}`,
			clear: { assignedTo: [] },
		});
	}

	const createdChip = dateRangeChip(
		"createdRange",
		"leads.filters.createdRange",
		filters.createdFrom,
		filters.createdTo,
		{ createdFrom: "", createdTo: "" },
		t,
	);
	if (createdChip) chips.push(createdChip);

	const assignedAtChip = dateRangeChip(
		"assignedAtRange",
		"leads.filters.assignedAtRange",
		filters.assignedAtFrom,
		filters.assignedAtTo,
		{ assignedAtFrom: "", assignedAtTo: "" },
		t,
	);
	if (assignedAtChip) chips.push(assignedAtChip);

	const lastActionChip = dateRangeChip(
		"lastActionRange",
		"leads.filters.lastActionRange",
		filters.lastActionFrom,
		filters.lastActionTo,
		{ lastActionFrom: "", lastActionTo: "" },
		t,
	);
	if (lastActionChip) chips.push(lastActionChip);

	return chips;
}

export function clearAllAppliedFilters(filters) {
	return {
		...filters,
		...emptyDraftFilters(),
	};
}

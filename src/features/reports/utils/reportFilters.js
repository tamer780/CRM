import { getLast30DaysRange } from "../../../utils/date/dateRange";

export const REPORT_TABS = ["projects", "campaigns", "sources"];

export function emptyReportFilters() {
	const range = getLast30DaysRange();
	return {
		dateFrom: range.date_from,
		dateTo: range.date_to,
		projectId: "",
		campaignId: "",
		teamId: "",
		userId: "",
		source: "",
	};
}

const FILTER_KEYS = [
	"dateFrom",
	"dateTo",
	"projectId",
	"campaignId",
	"teamId",
	"userId",
	"source",
];

const URL_KEY_MAP = {
	dateFrom: "from",
	dateTo: "to",
	projectId: "project",
	campaignId: "campaign",
	teamId: "team",
	userId: "user",
	source: "source",
};

export function tabFromSearchParams(searchParams) {
	const tab = searchParams.get("tab");
	if (REPORT_TABS.includes(tab)) return tab;
	return "projects";
}

export function filtersFromSearchParams(searchParams) {
	const defaults = emptyReportFilters();
	const hasFilterKey = FILTER_KEYS.some((key) =>
		searchParams.has(URL_KEY_MAP[key]),
	);

	if (!hasFilterKey) {
		return defaults;
	}

	return {
		dateFrom: searchParams.get("from") ?? "",
		dateTo: searchParams.get("to") ?? "",
		projectId: searchParams.get("project") ?? "",
		campaignId: searchParams.get("campaign") ?? "",
		teamId: searchParams.get("team") ?? "",
		userId: searchParams.get("user") ?? "",
		source: searchParams.get("source") ?? "",
	};
}

export function applyFiltersToSearchParams(searchParams, filters, tab) {
	const next = new URLSearchParams(searchParams);
	if (tab && tab !== "projects") next.set("tab", tab);
	else next.delete("tab");

	for (const key of FILTER_KEYS) {
		const urlKey = URL_KEY_MAP[key];
		const value = filters[key];
		if (value) next.set(urlKey, String(value));
		else next.delete(urlKey);
	}
	return next;
}

export function clearFilterParams(searchParams, tab) {
	const next = new URLSearchParams();
	if (tab && tab !== "projects") next.set("tab", tab);
	const defaults = emptyReportFilters();
	next.set("from", defaults.dateFrom);
	next.set("to", defaults.dateTo);
	return next;
}

export function hasActiveReportFilters(filters) {
	const defaults = emptyReportFilters();
	return (
		filters.projectId ||
		filters.campaignId ||
		filters.teamId ||
		filters.userId ||
		filters.source ||
		filters.dateFrom !== defaults.dateFrom ||
		filters.dateTo !== defaults.dateTo
	);
}

function toStartOfDayIso(dateStr) {
	if (!dateStr) return null;
	const date = new Date(`${dateStr}T00:00:00`);
	if (Number.isNaN(date.getTime())) return null;
	return date.toISOString();
}

function toEndOfDayIso(dateStr) {
	if (!dateStr) return null;
	const date = new Date(`${dateStr}T23:59:59.999`);
	if (Number.isNaN(date.getTime())) return null;
	return date.toISOString();
}

function optionalInt(value) {
	if (value === "" || value == null) return null;
	const n = Number(value);
	return Number.isFinite(n) ? n : null;
}

/** Build API query params; omit null/empty. */
export function toApiParams(filters) {
	const raw = {
		date_from: toStartOfDayIso(filters.dateFrom),
		date_to: toEndOfDayIso(filters.dateTo),
		project_id: optionalInt(filters.projectId),
		campaign_id: optionalInt(filters.campaignId),
		team_id: optionalInt(filters.teamId),
		user_id: optionalInt(filters.userId),
		source: filters.source?.trim() || null,
	};

	const params = {};
	for (const [key, value] of Object.entries(raw)) {
		if (value != null && value !== "") params[key] = value;
	}
	return params;
}

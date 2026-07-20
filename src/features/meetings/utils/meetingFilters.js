export const emptyMeetingFilters = () => ({
	search: "",
	status: "",
	assignedId: "",
	leadId: "",
	dateFrom: "",
	dateTo: "",
});

const FILTER_KEYS = [
	"search",
	"status",
	"assignedId",
	"leadId",
	"dateFrom",
	"dateTo",
];

const URL_KEY_MAP = {
	search: "q",
	status: "status",
	assignedId: "assigned",
	leadId: "lead",
	dateFrom: "date_from",
	dateTo: "date_to",
};

export function filtersFromSearchParams(searchParams) {
	return {
		search: searchParams.get("q") ?? "",
		status: searchParams.get("status") ?? "",
		assignedId: searchParams.get("assigned") ?? "",
		leadId: searchParams.get("lead") ?? "",
		dateFrom: searchParams.get("date_from") ?? "",
		dateTo: searchParams.get("date_to") ?? "",
	};
}

export function applyFiltersToSearchParams(searchParams, filters) {
	const next = new URLSearchParams(searchParams);
	for (const key of FILTER_KEYS) {
		const urlKey = URL_KEY_MAP[key];
		const value = filters[key];
		if (value) next.set(urlKey, String(value));
		else next.delete(urlKey);
	}
	return next;
}

export function clearFilterParams(searchParams) {
	const next = new URLSearchParams(searchParams);
	for (const urlKey of Object.values(URL_KEY_MAP)) {
		next.delete(urlKey);
	}
	next.delete("page");
	return next;
}

export function hasActiveMeetingFilters(filters) {
	return FILTER_KEYS.some((key) => Boolean(filters[key]));
}

/** Maps UI filter state to API query params for useMeetings. */
export function filtersToApiParams(filters) {
	return {
		assigned_to: filters.assignedId ? [filters.assignedId] : [],
		status: filters.status ? [filters.status] : [],
		date_from: filters.dateFrom || undefined,
		date_to: filters.dateTo || undefined,
		lead_id: filters.leadId || undefined,
	};
}

/** Client-side search over the already server-filtered list. */
export function filterMeetingsLocally(list, filters) {
	const q = (filters.search ?? "").trim().toLowerCase();
	if (!q) return list ?? [];

	return (list ?? []).filter((meeting) => {
		const lead = meeting.lead;
		const assignee = meeting.assignee;
		const haystack = [
			meeting.notes,
			meeting.status,
			lead?.name,
			lead?.phone,
			assignee?.name,
			assignee?.email,
			meeting.lead_id != null ? `lead ${meeting.lead_id}` : "",
		]
			.filter(Boolean)
			.join(" ")
			.toLowerCase();
		return haystack.includes(q);
	});
}

export function parseTableState(searchParams) {
	const sort = searchParams.get("sort") ?? "";
	const order = searchParams.get("order") === "desc" ? "desc" : "asc";
	const selected = searchParams.get("selected") ?? "";
	return { sort, order, selected };
}

export function sortingFromParams(sort, order) {
	if (!sort) return [];
	return [{ id: sort, desc: order === "desc" }];
}

export function applySortingToParams(searchParams, sorting) {
	const next = new URLSearchParams(searchParams);
	const first = sorting[0];
	if (first?.id) {
		next.set("sort", first.id);
		next.set("order", first.desc ? "desc" : "asc");
	} else {
		next.delete("sort");
		next.delete("order");
	}
	return next;
}

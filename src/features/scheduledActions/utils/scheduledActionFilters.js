export const emptyScheduledActionFilters = () => ({
	search: "",
	type: "",
	status: "",
	assignedId: "",
});

const FILTER_KEYS = ["search", "type", "status", "assignedId"];

const URL_KEY_MAP = {
	search: "q",
	type: "type",
	status: "status",
	assignedId: "assigned",
};

export function filtersFromSearchParams(searchParams) {
	return {
		search: searchParams.get("q") ?? "",
		type: searchParams.get("type") ?? "",
		status: searchParams.get("status") ?? "",
		assignedId: searchParams.get("assigned") ?? "",
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

export function hasActiveScheduledActionFilters(filters) {
	return FILTER_KEYS.some((key) => Boolean(filters[key]));
}

export function filterScheduledActions(list, filters) {
	const q = filters.search.trim().toLowerCase();

	return (list ?? []).filter((action) => {
		if (filters.type && action.type !== filters.type) return false;
		if (filters.status && action.status !== filters.status) return false;
		if (
			filters.assignedId &&
			String(action.assigned_to) !== String(filters.assignedId)
		) {
			return false;
		}
		if (q) {
			const haystack = [
				action.note,
				action.outcome,
				action.type,
				action.status,
				action.lead_id != null ? `lead ${action.lead_id}` : "",
				action.client_id != null ? `client ${action.client_id}` : "",
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();
			if (!haystack.includes(q)) return false;
		}
		return true;
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

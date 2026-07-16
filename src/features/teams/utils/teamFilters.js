export const emptyTeamFilters = () => ({
	search: "",
	leaderId: "",
	supervisorId: "",
});

const FILTER_KEYS = ["search", "leaderId", "supervisorId"];

const URL_KEY_MAP = {
	search: "q",
	leaderId: "leader",
	supervisorId: "supervisor",
};

export function filtersFromSearchParams(searchParams) {
	return {
		search: searchParams.get("q") ?? "",
		leaderId: searchParams.get("leader") ?? "",
		supervisorId: searchParams.get("supervisor") ?? "",
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

export function hasActiveTeamFilters(filters) {
	return FILTER_KEYS.some((key) => Boolean(filters[key]));
}

export function filterTeams(list, filters) {
	const q = filters.search.trim().toLowerCase();

	return (list ?? []).filter((team) => {
		if (
			filters.leaderId &&
			String(team.team_leader_id) !== String(filters.leaderId)
		) {
			return false;
		}
		if (
			filters.supervisorId &&
			String(team.supervisor_id) !== String(filters.supervisorId)
		) {
			return false;
		}
		if (q) {
			const haystack = (team.name ?? "").toLowerCase();
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

export const emptyProjectFilters = () => ({
	search: "",
	status: "",
	teamId: "",
	dateFrom: "",
	dateTo: "",
});

const FILTER_KEYS = ["search", "status", "teamId", "dateFrom", "dateTo"];

const URL_KEY_MAP = {
	search: "q",
	status: "status",
	teamId: "team",
	dateFrom: "from",
	dateTo: "to",
};

export function filtersFromSearchParams(searchParams) {
	return {
		search: searchParams.get("q") ?? "",
		status: searchParams.get("status") ?? "",
		teamId: searchParams.get("team") ?? "",
		dateFrom: searchParams.get("from") ?? "",
		dateTo: searchParams.get("to") ?? "",
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

export function hasActiveProjectFilters(filters) {
	return FILTER_KEYS.some((key) => Boolean(filters[key]));
}

function inDateRange(startedAt, dateFrom, dateTo) {
	if (!dateFrom && !dateTo) return true;
	if (!startedAt) return false;
	const ts = new Date(startedAt).getTime();
	if (Number.isNaN(ts)) return false;
	if (dateFrom) {
		const start = new Date(`${dateFrom}T00:00:00`).getTime();
		if (ts < start) return false;
	}
	if (dateTo) {
		const end = new Date(`${dateTo}T23:59:59.999`).getTime();
		if (ts > end) return false;
	}
	return true;
}

function projectHasTeam(project, teamId) {
	if (!teamId) return true;
	const ids = Array.isArray(project.team_ids)
		? project.team_ids
		: Array.isArray(project.teams)
			? project.teams.map((t) => t.id)
			: [];
	return ids.some((id) => String(id) === String(teamId));
}

export function filterProjects(list, filters) {
	const q = filters.search.trim().toLowerCase();

	return (list ?? []).filter((project) => {
		if (filters.status && project.status !== filters.status) {
			return false;
		}
		if (!projectHasTeam(project, filters.teamId)) {
			return false;
		}
		if (!inDateRange(project.started_at, filters.dateFrom, filters.dateTo)) {
			return false;
		}
		if (q) {
			const haystack = [project.name, project.description]
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

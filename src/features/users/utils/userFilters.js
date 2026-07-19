import { getUserRole, getUserTeamName, isUserActive } from "./userConstants";

export const emptyUserFilters = () => ({
	search: "",
	role: "",
	status: "",
});

const FILTER_KEYS = ["search", "role", "status"];

const URL_KEY_MAP = {
	search: "q",
	role: "role",
	status: "status",
};

export function filtersFromSearchParams(searchParams) {
	return {
		search: searchParams.get("q") ?? "",
		role: searchParams.get("role") ?? "",
		status: searchParams.get("status") ?? "",
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

export function hasActiveUserFilters(filters) {
	return FILTER_KEYS.some((key) => Boolean(filters[key]));
}

export function filterUsers(list, filters, teams = []) {
	const q = filters.search.trim().toLowerCase();

	return (list ?? []).filter((user) => {
		if (filters.role && getUserRole(user) !== filters.role) {
			return false;
		}
		if (filters.status === "active" && !isUserActive(user)) {
			return false;
		}
		if (filters.status === "inactive" && isUserActive(user)) {
			return false;
		}
		if (q) {
			const haystack = [
				user.name,
				user.email,
				user.phone,
				user.job_title,
				getUserRole(user),
				getUserTeamName(user, teams),
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

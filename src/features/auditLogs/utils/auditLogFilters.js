import { shortModelName } from "./auditLogConstants";

export const emptyAuditLogFilters = () => ({
	search: "",
	action: "",
	model: "",
	userId: "",
});

const FILTER_KEYS = ["search", "action", "model", "userId"];

const URL_KEY_MAP = {
	search: "q",
	action: "action",
	model: "model",
	userId: "user",
};

export function filtersFromSearchParams(searchParams) {
	return {
		search: searchParams.get("q") ?? "",
		action: searchParams.get("action") ?? "",
		model: searchParams.get("model") ?? "",
		userId: searchParams.get("user") ?? "",
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

export function hasActiveAuditLogFilters(filters) {
	return FILTER_KEYS.some((key) => Boolean(filters[key]));
}

export function filterAuditLogs(list, filters) {
	const q = filters.search.trim().toLowerCase();

	return (list ?? []).filter((log) => {
		if (filters.action && log.action !== filters.action) return false;
		if (filters.model && shortModelName(log.auditable_type) !== filters.model) {
			return false;
		}
		if (filters.userId && String(log.user_id) !== String(filters.userId)) {
			return false;
		}
		if (q) {
			const haystack = [
				log.action,
				shortModelName(log.auditable_type),
				log.auditable_id,
				log.ip_address,
				log.user_agent,
				log.user_id,
			]
				.filter((v) => v != null && v !== "")
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

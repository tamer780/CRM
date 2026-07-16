export const emptyClientFilters = () => ({
	search: "",
	status: "",
	projectId: "",
	campaignId: "",
	assignedTo: "",
	source: "",
	dateFrom: "",
	dateTo: "",
});

const FILTER_KEYS = [
	"search",
	"status",
	"projectId",
	"campaignId",
	"assignedTo",
	"source",
	"dateFrom",
	"dateTo",
];

const URL_KEY_MAP = {
	search: "q",
	status: "status",
	projectId: "project",
	campaignId: "campaign",
	assignedTo: "assigned",
	source: "source",
	dateFrom: "from",
	dateTo: "to",
};

export function filtersFromSearchParams(searchParams) {
	return {
		search: searchParams.get("q") ?? "",
		status: searchParams.get("status") ?? "",
		projectId: searchParams.get("project") ?? "",
		campaignId: searchParams.get("campaign") ?? "",
		assignedTo: searchParams.get("assigned") ?? "",
		source: searchParams.get("source") ?? "",
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

export function hasActiveClientFilters(filters) {
	return FILTER_KEYS.some((key) => Boolean(filters[key]));
}

function inDateRange(convertedAt, dateFrom, dateTo) {
	if (!dateFrom && !dateTo) return true;
	if (!convertedAt) return false;
	const ts = new Date(convertedAt).getTime();
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

export function filterClients(list, filters) {
	const q = filters.search.trim().toLowerCase();

	return (list ?? []).filter((client) => {
		if (filters.status && client.status !== filters.status) {
			return false;
		}
		if (filters.source && client.source !== filters.source) {
			return false;
		}
		if (
			filters.projectId &&
			String(client.project_id) !== String(filters.projectId)
		) {
			return false;
		}
		if (
			filters.campaignId &&
			String(client.campaign_id) !== String(filters.campaignId)
		) {
			return false;
		}
		if (
			filters.assignedTo &&
			String(client.assigned_to) !== String(filters.assignedTo)
		) {
			return false;
		}
		if (
			!inDateRange(client.converted_at, filters.dateFrom, filters.dateTo)
		) {
			return false;
		}
		if (q) {
			const haystack = [client.name, client.phone, client.email]
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

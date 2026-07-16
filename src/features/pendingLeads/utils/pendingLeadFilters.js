export const emptyPendingFilters = () => ({
	search: "",
	status: "",
	source: "",
	projectId: "",
	campaignId: "",
	dateFrom: "",
	dateTo: "",
});

const FILTER_KEYS = [
	"search",
	"status",
	"source",
	"projectId",
	"campaignId",
	"dateFrom",
	"dateTo",
];

const URL_KEY_MAP = {
	search: "q",
	status: "status",
	source: "source",
	projectId: "project",
	campaignId: "campaign",
	dateFrom: "from",
	dateTo: "to",
};

export function filtersFromSearchParams(searchParams) {
	return {
		search: searchParams.get("q") ?? "",
		status: searchParams.get("status") ?? "",
		source: searchParams.get("source") ?? "",
		projectId: searchParams.get("project") ?? "",
		campaignId: searchParams.get("campaign") ?? "",
		dateFrom: searchParams.get("from") ?? "",
		dateTo: searchParams.get("to") ?? "",
	};
}

export function applyFiltersToSearchParams(searchParams, filters) {
	const next = new URLSearchParams(searchParams);

	for (const key of FILTER_KEYS) {
		const urlKey = URL_KEY_MAP[key];
		const value = filters[key];
		if (value) {
			next.set(urlKey, String(value));
		} else {
			next.delete(urlKey);
		}
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

export function hasActivePendingFilters(filters) {
	return FILTER_KEYS.some((key) => Boolean(filters[key]));
}

export function inDateRange(createdAt, dateFrom, dateTo) {
	if (!dateFrom && !dateTo) return true;
	if (!createdAt) return false;
	const ts = new Date(createdAt).getTime();
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

export function filterPendingLeads(list, filters) {
	const q = filters.search.trim().toLowerCase();

	return (list ?? []).filter((lead) => {
		if (filters.status && lead.duplicate_status !== filters.status) {
			return false;
		}
		if (filters.source && lead.source !== filters.source) {
			return false;
		}
		if (
			filters.projectId &&
			String(lead.project_id) !== String(filters.projectId)
		) {
			return false;
		}
		if (
			filters.campaignId &&
			String(lead.campaign_id) !== String(filters.campaignId)
		) {
			return false;
		}
		if (!inDateRange(lead.created_at, filters.dateFrom, filters.dateTo)) {
			return false;
		}
		if (q) {
			const haystack = [lead.name, lead.phone, lead.email]
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

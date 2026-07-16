export const emptyCampaignFilters = () => ({
	search: "",
	platform: "",
	status: "",
	projectId: "",
	dateFrom: "",
	dateTo: "",
});

const FILTER_KEYS = [
	"search",
	"platform",
	"status",
	"projectId",
	"dateFrom",
	"dateTo",
];

const URL_KEY_MAP = {
	search: "q",
	platform: "platform",
	status: "status",
	projectId: "project",
	dateFrom: "from",
	dateTo: "to",
};

export function filtersFromSearchParams(searchParams) {
	return {
		search: searchParams.get("q") ?? "",
		platform: searchParams.get("platform") ?? "",
		status: searchParams.get("status") ?? "",
		projectId: searchParams.get("project") ?? "",
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

export function hasActiveCampaignFilters(filters) {
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

export function filterCampaigns(list, filters) {
	const q = filters.search.trim().toLowerCase();

	return (list ?? []).filter((campaign) => {
		if (filters.platform && campaign.platform !== filters.platform) {
			return false;
		}
		if (filters.status && campaign.status !== filters.status) {
			return false;
		}
		if (
			filters.projectId &&
			String(campaign.project_id) !== String(filters.projectId)
		) {
			return false;
		}
		if (!inDateRange(campaign.started_at, filters.dateFrom, filters.dateTo)) {
			return false;
		}
		if (q) {
			const haystack = [campaign.name, campaign.external_reference]
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

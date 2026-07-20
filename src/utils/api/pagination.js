import { extractData } from "./apiHelpers";

export const DEFAULT_PAGE_SIZE = 15;

function readItems(payload, listKeys = []) {
	if (Array.isArray(payload)) return payload;

	for (const key of listKeys) {
		if (Array.isArray(payload?.[key])) return payload[key];
	}

	if (Array.isArray(payload?.data)) return payload.data;

	return [];
}

function readMeta(payload, response) {
	const meta =
		payload?.meta ??
		response?.meta ??
		(typeof payload === "object" && !Array.isArray(payload) ? payload : null) ??
		response ??
		{};

	return {
		currentPage: Number(meta.current_page ?? meta.currentPage ?? 1),
		lastPage: Number(meta.last_page ?? meta.lastPage ?? 1),
		total: Number(meta.total ?? 0),
		perPage: Number(meta.per_page ?? meta.perPage ?? DEFAULT_PAGE_SIZE),
		nextPageUrl:
			meta.next_page_url ??
			meta.nextPageUrl ??
			response?.links?.next ??
			payload?.links?.next ??
			null,
	};
}

export function extractPaginatedList(response, { listKeys = [] } = {}) {
	const payload = extractData(response);
	const items = readItems(payload, listKeys);
	const metaSource =
		typeof payload === "object" && payload !== null && !Array.isArray(payload)
			? payload
			: response;
	const meta = readMeta(metaSource, response);

	return {
		items,
		currentPage: meta.currentPage,
		lastPage: meta.lastPage,
		total: meta.total || items.length,
		perPage: meta.perPage,
		nextPageUrl: meta.nextPageUrl,
	};
}

export function getNextPageParam(lastPage) {
	if (!lastPage) return undefined;

	const { currentPage, lastPage: last, nextPageUrl } = lastPage;

	if (nextPageUrl == null) return undefined;
	if (Number.isFinite(last) && currentPage >= last) return undefined;

	return currentPage + 1;
}

export function flattenInfinitePages(pages) {
	return (pages ?? []).flatMap((page) => page?.items ?? []);
}

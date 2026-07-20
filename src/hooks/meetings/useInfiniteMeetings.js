import { useInfiniteQuery } from "@tanstack/react-query";
import { getMeetings } from "../../services/meetings/meetingsService";
import {
	DEFAULT_PAGE_SIZE,
	extractPaginatedList,
	flattenInfinitePages,
	getNextPageParam,
} from "../../utils/api/pagination";
import { getToken } from "../../utils/token/tokenStorage";

function normalizeList(items) {
	if (Array.isArray(items)) return items;
	return [];
}

export function useInfiniteMeetings(filters = {}, { enabled = true } = {}) {
	const {
		assigned_to,
		status,
		date_from,
		date_to,
		lead_id,
		per_page = DEFAULT_PAGE_SIZE,
	} = filters;

	const queryKey = {
		assigned_to: assigned_to ?? [],
		status: status ?? [],
		date_from: date_from ?? "",
		date_to: date_to ?? "",
		lead_id: lead_id ?? "",
		per_page,
	};

	const query = useInfiniteQuery({
		queryKey: ["meetings", "infinite", queryKey],
		initialPageParam: 1,
		queryFn: async ({ pageParam }) => {
			const response = await getMeetings({
				page: pageParam,
				assigned_to,
				status,
				date_from,
				date_to,
				lead_id,
				per_page,
			});
			const page = extractPaginatedList(response, { listKeys: ["meetings"] });
			return {
				...page,
				items: normalizeList(page.items),
			};
		},
		getNextPageParam,
		enabled: !!getToken() && enabled,
		staleTime: 60 * 1000,
	});

	const pages = query.data?.pages ?? [];
	const items = flattenInfinitePages(pages);
	const total = pages[0]?.total ?? items.length;

	return {
		...query,
		data: items,
		total,
	};
}

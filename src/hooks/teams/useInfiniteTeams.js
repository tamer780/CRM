import { useInfiniteQuery } from "@tanstack/react-query";
import { getTeams } from "../../services/teams/teamsService";
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

export function useInfiniteTeams({ enabled = true, perPage = DEFAULT_PAGE_SIZE } = {}) {
	const query = useInfiniteQuery({
		queryKey: ["teams", "infinite", { perPage }],
		initialPageParam: 1,
		queryFn: async ({ pageParam }) => {
			const response = await getTeams({ page: pageParam, per_page: perPage });
			const page = extractPaginatedList(response, { listKeys: ["teams"] });
			return {
				...page,
				items: normalizeList(page.items),
			};
		},
		getNextPageParam,
		enabled: !!getToken() && enabled,
		staleTime: 5 * 60 * 1000,
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

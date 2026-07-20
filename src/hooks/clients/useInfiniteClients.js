import { useInfiniteQuery } from "@tanstack/react-query";
import { getClients } from "../../services/clients/clientsService";
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

export function useInfiniteClients({ perPage = DEFAULT_PAGE_SIZE } = {}) {
	const query = useInfiniteQuery({
		queryKey: ["clients", "infinite", { perPage }],
		initialPageParam: 1,
		queryFn: async ({ pageParam }) => {
			const response = await getClients({ page: pageParam, per_page: perPage });
			const page = extractPaginatedList(response, { listKeys: ["clients"] });
			return {
				...page,
				items: normalizeList(page.items),
			};
		},
		getNextPageParam,
		enabled: !!getToken(),
		staleTime: 60 * 1000,
		refetchOnMount: "always",
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

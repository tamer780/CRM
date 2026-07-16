import { useQuery } from "@tanstack/react-query";
import { getLeads } from "../../services/leads/leadsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

export function useRecentLeads(perPage = 5) {
	return useQuery({
		queryKey: ["leads", "recent", { per_page: perPage }],
		queryFn: async () => {
			const response = await getLeads({ per_page: perPage });
			const payload = extractData(response);

			if (Array.isArray(payload)) {
				return payload.slice(0, perPage);
			}

			const list = payload?.data ?? payload?.leads ?? [];
			return Array.isArray(list) ? list.slice(0, perPage) : [];
		},
		enabled: !!getToken(),
		staleTime: 60 * 1000,
	});
}

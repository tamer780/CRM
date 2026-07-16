import { useQuery } from "@tanstack/react-query";
import { normalizePendingLeadsList } from "../../features/pendingLeads/utils/pendingLeadConstants";
import { getPendingLeads } from "../../services/pendingLeads/pendingLeadsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

export function usePendingLeads({ enabled = true } = {}) {
	return useQuery({
		queryKey: ["pendingLeads", "list"],
		queryFn: async () => {
			const response = await getPendingLeads();
			return normalizePendingLeadsList(extractData(response));
		},
		enabled: !!getToken() && enabled,
		staleTime: 60 * 1000,
	});
}

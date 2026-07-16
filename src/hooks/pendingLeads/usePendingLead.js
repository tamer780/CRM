import { useQuery } from "@tanstack/react-query";
import { getPendingLead } from "../../services/pendingLeads/pendingLeadsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

export function usePendingLead(pendingLeadId) {
	return useQuery({
		queryKey: ["pendingLeads", String(pendingLeadId)],
		queryFn: async () => {
			const response = await getPendingLead(pendingLeadId);
			return extractData(response);
		},
		enabled: !!getToken() && !!pendingLeadId,
		staleTime: 60 * 1000,
	});
}

import { useQuery } from "@tanstack/react-query";
import { getLead } from "../../services/leads/leadsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

export function useLead(leadId) {
	return useQuery({
		queryKey: ["leads", String(leadId)],
		queryFn: async () => {
			const response = await getLead(leadId);
			return extractData(response);
		},
		enabled: !!getToken() && !!leadId,
		staleTime: 60 * 1000,
	});
}

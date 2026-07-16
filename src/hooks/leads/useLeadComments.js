import { useQuery } from "@tanstack/react-query";
import { getLeadComments } from "../../services/leads/leadsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

export function normalizeLeadComments(payload) {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload?.comments)) return payload.comments;
	return [];
}

export function useLeadComments(leadId) {
	return useQuery({
		queryKey: ["leads", String(leadId), "comments"],
		queryFn: async () => {
			const response = await getLeadComments(leadId);
			return normalizeLeadComments(extractData(response));
		},
		enabled: !!getToken() && !!leadId,
		staleTime: 30 * 1000,
	});
}

import { useQuery } from "@tanstack/react-query";
import { getLeads } from "../../services/leads/leadsService";
import { extractData } from "../../utils/api/apiHelpers";
import { normalizeLeadsList } from "../../utils/leads/leadConstants";
import { getToken } from "../../utils/token/tokenStorage";

function normalizeStatusParams(status) {
	// Undefined = no status filter (dashboard / other pages keep full list).
	if (status === undefined) return [];
	if (!Array.isArray(status) || status.length === 0) return ["default"];
	const cleaned = status.map(String).filter(Boolean);
	return cleaned.length > 0 ? cleaned : ["default"];
}

export function useLeads({ status } = {}) {
	const statusParams = normalizeStatusParams(status);

	return useQuery({
		queryKey: ["leads", "list", statusParams],
		queryFn: async () => {
			const response = await getLeads({
				status: statusParams.length > 0 ? statusParams : undefined,
			});
			return normalizeLeadsList(extractData(response));
		},
		enabled: !!getToken(),
		staleTime: 60 * 1000,
	});
}

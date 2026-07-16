import { useQuery } from "@tanstack/react-query";
import { getCampaigns } from "../../services/campaigns/campaignsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

function normalizeList(payload) {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload?.campaigns)) return payload.campaigns;
	return [];
}

export function useCampaigns({ enabled = true } = {}) {
	return useQuery({
		queryKey: ["campaigns", "list"],
		queryFn: async () => {
			const response = await getCampaigns();
			return normalizeList(extractData(response));
		},
		enabled: !!getToken() && enabled,
		staleTime: 5 * 60 * 1000,
	});
}

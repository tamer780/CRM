import { useQuery } from "@tanstack/react-query";
import { getCampaign } from "../../services/campaigns/campaignsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

export function useCampaign(campaignId) {
	return useQuery({
		queryKey: ["campaigns", String(campaignId)],
		queryFn: async () => {
			const response = await getCampaign(campaignId);
			return extractData(response);
		},
		enabled: !!getToken() && !!campaignId,
		staleTime: 60 * 1000,
	});
}

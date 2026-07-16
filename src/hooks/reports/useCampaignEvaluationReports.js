import { useQuery } from "@tanstack/react-query";
import { getCampaignEvaluationReports } from "../../services/reports/reportsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

function normalizeList(payload) {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload?.campaigns)) return payload.campaigns;
	return [];
}

export function useCampaignEvaluationReports(
	params = {},
	{ enabled = true } = {},
) {
	return useQuery({
		queryKey: ["reports", "campaigns", params],
		queryFn: async () => {
			const response = await getCampaignEvaluationReports(params);
			return normalizeList(extractData(response));
		},
		enabled: !!getToken() && enabled,
		staleTime: 60 * 1000,
	});
}

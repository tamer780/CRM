import { useQuery } from "@tanstack/react-query";
import { getSourceReports } from "../../services/reports/reportsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

function normalizeList(payload) {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload?.sources)) return payload.sources;
	return [];
}

export function useSourceReports(params = {}, { enabled = true } = {}) {
	return useQuery({
		queryKey: ["reports", "sources", params],
		queryFn: async () => {
			const response = await getSourceReports(params);
			return normalizeList(extractData(response));
		},
		enabled: !!getToken() && enabled,
		staleTime: 60 * 1000,
	});
}

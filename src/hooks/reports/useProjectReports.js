import { useQuery } from "@tanstack/react-query";
import { getProjectReports } from "../../services/reports/reportsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

function normalizeList(payload) {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload?.projects)) return payload.projects;
	return [];
}

export function useProjectReports(params = {}, { enabled = true } = {}) {
	return useQuery({
		queryKey: ["reports", "projects", params],
		queryFn: async () => {
			const response = await getProjectReports(params);
			return normalizeList(extractData(response));
		},
		enabled: !!getToken() && enabled,
		staleTime: 60 * 1000,
	});
}

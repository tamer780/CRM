import { useQuery } from "@tanstack/react-query";
import { getTeamsKpis } from "../../services/health/healthService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

export function useTeamKpis({ date_from, date_to, enabled = true } = {}) {
	const hasPeriod = Boolean(date_from && date_to);

	return useQuery({
		queryKey: ["kpis", "teams", { date_from, date_to }],
		queryFn: async () => {
			const response = await getTeamsKpis({ date_from, date_to });
			const payload = extractData(response);
			return Array.isArray(payload) ? payload : (payload?.teams ?? []);
		},
		enabled: !!getToken() && hasPeriod && enabled,
		staleTime: 60 * 1000,
	});
}

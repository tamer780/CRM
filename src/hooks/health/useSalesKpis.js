import { useQuery } from "@tanstack/react-query";
import { getSalesKpis } from "../../services/health/healthService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

export function useSalesKpis({ date_from, date_to, enabled = true } = {}) {
	const hasPeriod = Boolean(date_from && date_to);

	return useQuery({
		queryKey: ["kpis", "sales", { date_from, date_to }],
		queryFn: async () => {
			const response = await getSalesKpis({ date_from, date_to });
			return extractData(response) ?? {};
		},
		enabled: !!getToken() && hasPeriod && enabled,
		staleTime: 60 * 1000,
	});
}

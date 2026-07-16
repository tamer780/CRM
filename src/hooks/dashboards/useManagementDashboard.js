import { useQuery } from "@tanstack/react-query";
import { getManagementDashboard } from "../../services/dashboards/dashboardsService";
import { extractData } from "../../utils/api/apiHelpers";
import { getToken } from "../../utils/token/tokenStorage";

export function useManagementDashboard({ enabled = true } = {}) {
	return useQuery({
		queryKey: ["dashboards", "management"],
		queryFn: async () => {
			const response = await getManagementDashboard();
			return extractData(response);
		},
		enabled: !!getToken() && enabled,
		staleTime: 60 * 1000,
	});
}
